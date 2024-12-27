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
    this.scannedFiles = []
    this.featureRefs = []
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

    console.log('\nScanning files:')

    // Analyze source files
    for (const file of files) {
      try {
        console.log(chalk.gray(`Analyzing ${file}`))
        const content = readFileSync(file, 'utf8')
        await this.analyzeFile(content, file)
      } catch (error) {
        console.error(chalk.red(`Error analyzing ${file}:`), error)
      }
    }

    // Analyze test files
    for (const file of testFiles) {
      try {
        console.log(chalk.gray(`Analyzing test ${file}`))
        const content = readFileSync(file, 'utf8')
        await this.analyzeFile(content, file, true)
      } catch (error) {
        console.error(chalk.red(`Error analyzing test ${file}:`), error)
      }
    }
  }

  analyzeFile(content, filename, isTest = false) {
    this.scannedFiles.push(filename)

    // For Vue files, analyze both script and template sections
    if (filename.endsWith('.vue')) {
      let scriptContent = ''
      let templateContent = ''

      // Extract script content
      const scriptMatch = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)
      if (scriptMatch) {
        scriptContent = scriptMatch[1]
        console.log(chalk.gray(`Found script content in ${filename}`))
      }

      // Extract template content
      const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
      if (templateMatch) {
        console.log(chalk.gray(`Found template content in ${filename}`))

        // Log the template content for debugging
        console.log(chalk.gray('Template content:'))
        console.log(templateMatch[1])

        // Convert template to analyzable code
        templateContent = templateMatch[1]
          .split('\n')
          .map((line) => {
            // Match and convert feature checks in v-if directives
            const featureMatch = line.match(/v-if="isFeatureEnabled\('([^']+)'\)"/)
            if (featureMatch) {
              console.log(chalk.green(`Found feature check in template: ${featureMatch[1]}`))
              return `/* Template */ isFeatureEnabled('${featureMatch[1]}');`
            }
            return ''
          })
          .filter(Boolean)
          .join('\n')

        console.log(chalk.gray('Converted template content:'))
        console.log(templateContent)
      }

      // Combine for analysis with clear separation
      content = [
        '// Script content',
        scriptContent,
        '// Template-derived content',
        templateContent,
      ].join('\n')
    }

    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })

      traverse(ast, {
        // Look for useFeature and isFeatureEnabled calls
        CallExpression: (path) => {
          if (
            path.node.callee.name === 'useFeature' ||
            path.node.callee.name === 'isFeatureEnabled'
          ) {
            const featurePath = path.node.arguments[0]?.value
            if (featurePath) {
              console.log(chalk.green(`Found feature reference: ${featurePath} in ${filename}`))
              this.recordFeatureUsage(featurePath, filename, isTest)
            }
          }
        },
        // Look for direct feature references
        MemberExpression: (path) => {
          if (path.node.object.name === 'features') {
            const featurePath = this.extractFeaturePath(path.node)
            if (featurePath) {
              console.log(
                chalk.green(`Found direct feature reference: ${featurePath} in ${filename}`),
              )
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
    this.featureRefs.push({ path: featurePath, file: filename })
    const coverage = this.coverage.get(featurePath)
    if (!coverage) {
      console.log(
        chalk.yellow(`Warning: Reference to unknown feature path: ${featurePath} in ${filename}`),
      )
      return
    }

    coverage.implemented = true
    coverage.references.push(filename)

    if (isTest) {
      coverage.tests.add(filename)
    } else if (filename.includes('/components/')) {
      coverage.components.add(filename)
    }

    // For Vue files, only count lines in the relevant section containing the feature
    const content = readFileSync(filename, 'utf8')
    if (filename.endsWith('.vue')) {
      // Split the file into lines
      const lines = content.split('\n')
      const featureLines = []
      let inRelevantBlock = false
      let blockIndentation = 0

      // Find the section with our feature and track its scope
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.includes(`isFeatureEnabled('${featurePath}')`)) {
          inRelevantBlock = true
          // Get the indentation level of the feature check
          blockIndentation = line.search(/\S/)
          featureLines.push(line)
        } else if (inRelevantBlock) {
          // Check if we've exited the block (lower or equal indentation)
          const currentIndentation = line.search(/\S/)
          if (currentIndentation <= blockIndentation && line.trim() !== '') {
            inRelevantBlock = false
          } else {
            featureLines.push(line)
          }
        }
      }

      coverage.sloc = featureLines.filter(
        (line) => line.trim() && !line.trim().startsWith('//'),
      ).length
    } else {
      // For non-Vue files, count all non-comment lines
      coverage.sloc += content
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('//')).length
    }
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
      if (data.references.length > 0) {
        console.log('  Referenced in:')
        data.references.forEach((ref) => console.log(`    - ${ref}`))
      }
    })

    console.log('\nDebug Information:')
    console.log('Scanned Files:')
    this.scannedFiles.forEach((file) => console.log(`  - ${file}`))

    console.log('\nFeature References Found:')
    this.featureRefs.forEach((ref) => console.log(`  - ${ref.path} in ${ref.file}`))
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
