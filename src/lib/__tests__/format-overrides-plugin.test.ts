import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Plugin } from 'vite'

import { FORMAT_OVERRIDES_MODULE_ID, formatOverridesPlugin } from '../../../export-plugins/format-overrides-plugin'

interface DirectPluginHooks {
  resolveId: (id: string) => unknown
  load: (id: string) => unknown | Promise<unknown>
  configureServer?: (server: unknown) => void
}

function directHooks(plugin: Plugin): DirectPluginHooks {
  return plugin as Plugin & DirectPluginHooks
}

async function withTempRoot<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), 'format-overrides-'))
  try {
    return await fn(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

describe('formatOverridesPlugin', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns an empty sidecar bundle when format-overrides/ is missing', async () => {
    await withTempRoot(async (root) => {
      const plugin = directHooks(formatOverridesPlugin(root))
      const resolved = plugin.resolveId(FORMAT_OVERRIDES_MODULE_ID)
      expect(resolved).toBe('\0virtual:format-overrides')

      const loaded = await plugin.load('\0virtual:format-overrides')
      expect(String(loaded)).toContain('"version":1')
      expect(String(loaded)).toContain('"scopes":{}')
    })
  })

  it('embeds scoped sidecar JSON when a page sidecar exists', async () => {
    await withTempRoot(async (root) => {
      const expressionHash = `sha256:${'a'.repeat(64)}`

      await mkdir(join(root, 'format-overrides/pages'), { recursive: true })
      await writeFile(
        join(root, 'format-overrides/pages/index.json'),
        JSON.stringify({
          version: 1,
          overrides: {
            abc123: {
              target: {
                file: 'src/pages/index.tsx',
                tagName: 'h1',
                sourceKind: 'bound-expression',
                contentKey: null,
                contentKeyTemplate: null,
                expressionHash,
              },
              marks: { bold: true, italic: false, color: '#123abc' },
              updatedAt: '2026-05-28T12:00:00.000Z',
            },
          },
        }),
      )

      const plugin = directHooks(formatOverridesPlugin(root))
      const loaded = await plugin.load('\0virtual:format-overrides')

      expect(String(loaded)).toContain('"pages/index"')
      expect(String(loaded)).toContain('abc123')
      expect(String(loaded)).toContain('#123abc')
      expect(String(loaded)).toContain('export default')
    })
  })

  it('falls back to an empty scoped sidecar when JSON is invalid', async () => {
    await withTempRoot(async (root) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      await mkdir(join(root, 'format-overrides/pages'), { recursive: true })
      await writeFile(join(root, 'format-overrides/pages/index.json'), '{not json')

      const plugin = directHooks(formatOverridesPlugin(root))
      const loaded = await plugin.load('\0virtual:format-overrides')

      expect(String(loaded)).toContain('"version":1')
      expect(String(loaded)).toContain('"pages/index"')
      expect(String(loaded)).toContain('"overrides":{}')
      expect(warn).not.toHaveBeenCalled()
    })
  })

  it('falls back to an empty scoped sidecar when the sidecar version is unsupported', async () => {
    await withTempRoot(async (root) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      await mkdir(join(root, 'format-overrides'), { recursive: true })
      await writeFile(
        join(root, 'format-overrides/shared.json'),
        JSON.stringify({ version: 2, overrides: { abc123: {} } }),
      )

      const plugin = directHooks(formatOverridesPlugin(root))
      const loaded = await plugin.load('\0virtual:format-overrides')

      expect(String(loaded)).toContain('"version":1')
      expect(String(loaded)).toContain('"shared"')
      expect(String(loaded)).toContain('"overrides":{}')
      expect(String(loaded)).not.toContain('abc123')
      expect(warn).not.toHaveBeenCalled()
    })
  })

  it('warns about invalid sidecars during production builds', async () => {
    const previousNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      await withTempRoot(async (root) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        await mkdir(join(root, 'format-overrides/pages'), { recursive: true })
        await writeFile(join(root, 'format-overrides/pages/index.json'), '{not json')

        const plugin = directHooks(formatOverridesPlugin(root))
        const loaded = await plugin.load('\0virtual:format-overrides')

        expect(String(loaded)).toContain('"overrides":{}')
        expect(warn).not.toHaveBeenCalled()
      })
    } finally {
      if (previousNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = previousNodeEnv
      }
    }
  })

  it('ships as a build shim without a dev-server hook', () => {
    const plugin = directHooks(formatOverridesPlugin())
    expect(plugin.configureServer).toBeUndefined()
  })
})
