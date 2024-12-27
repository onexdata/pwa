// scripts/analyze-features.js
import * as parser from '@babel/parser'
import _traverse from '@babel/traverse'
const traverse = _traverse.default
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, relative } from 'path'
import { globSync } from 'glob'
import chalk from 'chalk'

// Load feature manifest
const features = JSON.parse(readFileSync('./src/features.json', 'utf8'))

class FeatureAnalyzer {
  constructor() {
    this.coverage = new Map()
    this.initializeCoverage()
  }

  initializeCoverage() {
    const processFeature = (path, feature) => {
      if (typeof feature !== 'object') return
      if (feature.enabled !== undefined) {
        // This is a feature definition
        this.coverage.set(path, {
          implemented: false,
          references: [],
          sloc: 0,
          components: new Set(),
          tests: new Set(),
        })
      } else {
        // This is a feature group, recurse
        Object.entries(feature).forEach(([key, value]) => {
          processFeature(`${path}${path ? '.' : ''}${key}`, value)
        })
      }
    }

    processFeature('', features)
  }

  async analyzeFiles() {
    // Find all Vue and JS files in src
    const files = globSync('src/**/*.{js,vue}', {
      ignore: ['src/**/*.{spec,test}.{js,vue}', 'node_modules/**'],
    })

    const testFiles = globSync('src/**/*.{spec,test}.{js,vue}', {
      ignore: ['node_modules/**'],
    })

    // Analyze source files
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf8')
        await this.analyzeFile(content, file)
      } catch (error) {
        console.error(chalk.red(`Error analyzing ${file}:`), error)
      }
    }

    // Analyze test files
    for (const file of testFiles) {
      try {
        const content = readFileSync(file, 'utf8')
        await this.analyzeFile(content, file, true)
      } catch (error) {
        console.error(chalk.red(`Error analyzing test ${file}:`), error)
      }
    }
  }

  analyzeFile(content, filename, isTest = false) {
    // Extract script content from Vue files
    if (filename.endsWith('.vue')) {
      const scriptMatch = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)
      if (!scriptMatch) return
      content = scriptMatch[1]
    }

    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })

      traverse(ast, {
        // Look for useFeature calls
        CallExpression: (path) => {
          if (path.node.callee.name === 'useFeature') {
            const featurePath = path.node.arguments[0]?.value
            if (featurePath) {
              this.recordFeatureUsage(featurePath, filename, isTest)
            }
          }
        },
        // Look for direct feature references
        MemberExpression: (path) => {
          if (path.node.object.name === 'features') {
            const featurePath = this.extractFeaturePath(path.node)
            if (featurePath) {
              this.recordFeatureUsage(featurePath, filename, isTest)
            }
          }
        },
      })
    } catch (error) {
      console.error(chalk.yellow(`Warning: Could not parse ${filename}`), error)
    }
  }

  extractFeaturePath(node) {
    const parts = []
    let current = node

    while (current.type === 'MemberExpression') {
      if (current.property.type === 'Identifier') {
        parts.unshift(current.property.name)
      }
      current = current.object
    }

    return parts.join('.')
  }

  recordFeatureUsage(featurePath, filename, isTest) {
    const coverage = this.coverage.get(featurePath)
    if (!coverage) return

    coverage.implemented = true
    coverage.references.push(filename)

    if (isTest) {
      coverage.tests.add(filename)
    } else if (filename.includes('/components/')) {
      coverage.components.add(filename)
    }

    // Calculate SLOC for the file
    const content = readFileSync(filename, 'utf8')
    coverage.sloc += content
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('//')).length
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFeatures: this.coverage.size,
        implementedFeatures: 0,
        testedFeatures: 0,
        totalSloc: 0,
      },
      features: {},
    }

    this.coverage.forEach((coverage, path) => {
      const feature = this.getFeatureFromPath(path)
      if (!feature) return

      if (coverage.implemented) {
        report.summary.implementedFeatures++
      }
      if (coverage.tests.size > 0) {
        report.summary.testedFeatures++
      }
      report.summary.totalSloc += coverage.sloc

      report.features[path] = {
        enabled: feature.enabled,
        implemented: coverage.implemented,
        sloc: coverage.sloc,
        testCount: coverage.tests.size,
        componentCount: coverage.components.size,
        references: coverage.references,
        status: this.getImplementationStatus(coverage, feature),
      }
    })

    return report
  }

  getFeatureFromPath(path) {
    const parts = path.split('.')
    let current = features
    for (const part of parts) {
      if (!current[part]) return null
      current = current[part]
    }
    return current
  }

  getImplementationStatus(coverage, feature) {
    if (!coverage.implemented) return 'NOT_IMPLEMENTED'
    if (coverage.tests.size === 0) return 'NEEDS_TESTS'
    if (!feature.enabled) return 'DISABLED'
    return 'IMPLEMENTED'
  }

  printReport(report) {
    console.log(chalk.bold('\nFeature Coverage Report'))
    console.log(chalk.gray('Generated at:'), report.timestamp)
    console.log('\nSummary:')
    console.log(chalk.blue('Total Features:'), report.summary.totalFeatures)
    console.log(chalk.green('Implemented:'), report.summary.implementedFeatures)
    console.log(chalk.yellow('Tested:'), report.summary.testedFeatures)
    console.log(chalk.magenta('Total SLOC:'), report.summary.totalSloc)

    console.log('\nFeature Details:')
    Object.entries(report.features).forEach(([path, data]) => {
      const status = this.formatStatus(data.status)
      console.log(`\n${chalk.bold(path)}`)
      console.log(`  Status: ${status}`)
      console.log(`  SLOC: ${data.sloc}`)
      console.log(`  Components: ${data.componentCount}`)
      console.log(`  Tests: ${data.testCount}`)
    })
  }

  formatStatus(status) {
    switch (status) {
      case 'IMPLEMENTED':
        return chalk.green('Implemented')
      case 'NOT_IMPLEMENTED':
        return chalk.red('Not Implemented')
      case 'NEEDS_TESTS':
        return chalk.yellow('Needs Tests')
      case 'DISABLED':
        return chalk.gray('Disabled')
      default:
        return status
    }
  }
}

// Run the analysis
async function main() {
  const analyzer = new FeatureAnalyzer()

  console.log(chalk.blue('Starting feature analysis...'))
  await analyzer.analyzeFiles()

  const report = analyzer.generateReport()
  analyzer.printReport(report)

  // Save report to file
  const reportsDir = 'reports'
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true })
  }

  writeFileSync('reports/feature-coverage.json', JSON.stringify(report, null, 2))

  console.log(chalk.blue('\nReport saved to reports/feature-coverage.json'))
}

main().catch((error) => {
  console.error(chalk.red('Analysis failed:'), error)
  process.exit(1)
})
