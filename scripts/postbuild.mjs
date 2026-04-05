/**
 * Post-build script: Fix Chrome Extension compatibility issues
 * - Remove crossorigin attributes from HTML (CSP violation)
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const htmlPath = resolve(__dirname, '..', 'dist', 'index.html')

let html = readFileSync(htmlPath, 'utf-8')

// Remove crossorigin attributes
html = html.replace(/\s+crossorigin/g, '')

writeFileSync(htmlPath, html, 'utf-8')
console.log('✅ Post-build: Removed crossorigin attributes from index.html')
