import { readFile } from 'fs/promises'

import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('fs/promises', async (importActual) => {
  const fs = await importActual()

  return {
    ...fs,
    readFile: vi.fn(fs.readFile),
  }
})

describe('getPackageJson', () => {
  let getPackageJson
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const newImport = await import('../../../src/utils/get-package-json.mjs')
    getPackageJson = newImport.default
  })

  test('should return the package.json of netlify-cli', async () => {
    const packageJson = await getPackageJson()

    expect(packageJson).not.toBeUndefined()
    expect(packageJson.name).toBe('netlify-cli')
  })

  test('should not re-read package.json', async () => {
    // first call reads from file-system
    await getPackageJson()
    expect(readFile).toHaveBeenCalledOnce()
    vi.mocked(readFile).mockClear()

    // second call should cache and not read from file-system
    const packageJson = await getPackageJson()

    expect(packageJson).not.toBeUndefined()
    expect(packageJson.name).toBe('netlify-cli')

    expect(readFile).not.toHaveBeenCalled()
  })
})
