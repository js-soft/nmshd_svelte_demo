import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const enmeshedTheme: CustomThemeConfig = {
	name: 'enmeshed',
	properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-color-base": "var(--color-surface-900)",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "6px",
		"--theme-rounded-container": "6px",
		"--theme-border-base": "2px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "255 255 255",
		"--on-secondary": "255 255 255",
		"--on-tertiary": "0 0 0",
		"--on-success": "255 255 255",
		"--on-warning": "255 255 255",
		"--on-error": "255 255 255",
		"--on-surface": "0 0 0",
		// =~= Theme Colors  =~=
		// primary | #17428d 
		"--color-primary-50": "220 227 238", // #dce3ee
		"--color-primary-100": "209 217 232", // #d1d9e8
		"--color-primary-200": "197 208 227", // #c5d0e3
		"--color-primary-300": "162 179 209", // #a2b3d1
		"--color-primary-400": "93 123 175", // #5d7baf
		"--color-primary-500": "23 66 141", // #17428d
		"--color-primary-600": "21 59 127", // #153b7f
		"--color-primary-700": "17 50 106", // #11326a
		"--color-primary-800": "14 40 85", // #0e2855
		"--color-primary-900": "11 32 69", // #0b2045
		// secondary | #1a80d9 
		"--color-secondary-50": "221 236 249", // #ddecf9
		"--color-secondary-100": "209 230 247", // #d1e6f7
		"--color-secondary-200": "198 223 246", // #c6dff6
		"--color-secondary-300": "163 204 240", // #a3ccf0
		"--color-secondary-400": "95 166 228", // #5fa6e4
		"--color-secondary-500": "26 128 217", // #1a80d9
		"--color-secondary-600": "23 115 195", // #1773c3
		"--color-secondary-700": "20 96 163", // #1460a3
		"--color-secondary-800": "16 77 130", // #104d82
		"--color-secondary-900": "13 63 106", // #0d3f6a
		// tertiary | #ff7600 
		"--color-tertiary-50": "255 234 217", // #ffead9
		"--color-tertiary-100": "255 228 204", // #ffe4cc
		"--color-tertiary-200": "255 221 191", // #ffddbf
		"--color-tertiary-300": "255 200 153", // #ffc899
		"--color-tertiary-400": "255 159 77", // #ff9f4d
		"--color-tertiary-500": "255 118 0", // #ff7600
		"--color-tertiary-600": "230 106 0", // #e66a00
		"--color-tertiary-700": "191 89 0", // #bf5900
		"--color-tertiary-800": "153 71 0", // #994700
		"--color-tertiary-900": "125 58 0", // #7d3a00
		// success | #428c17 
		"--color-success-50": "227 238 220", // #e3eedc
		"--color-success-100": "217 232 209", // #d9e8d1
		"--color-success-200": "208 226 197", // #d0e2c5
		"--color-success-300": "179 209 162", // #b3d1a2
		"--color-success-400": "123 175 93", // #7baf5d
		"--color-success-500": "66 140 23", // #428c17
		"--color-success-600": "59 126 21", // #3b7e15
		"--color-success-700": "50 105 17", // #326911
		"--color-success-800": "40 84 14", // #28540e
		"--color-success-900": "32 69 11", // #20450b
		// warning | #8c6117 
		"--color-warning-50": "238 231 220", // #eee7dc
		"--color-warning-100": "232 223 209", // #e8dfd1
		"--color-warning-200": "226 216 197", // #e2d8c5
		"--color-warning-300": "209 192 162", // #d1c0a2
		"--color-warning-400": "175 144 93", // #af905d
		"--color-warning-500": "140 97 23", // #8c6117
		"--color-warning-600": "126 87 21", // #7e5715
		"--color-warning-700": "105 73 17", // #694911
		"--color-warning-800": "84 58 14", // #543a0e
		"--color-warning-900": "69 48 11", // #45300b
		// error | #8c1742 
		"--color-error-50": "238 220 227", // #eedce3
		"--color-error-100": "232 209 217", // #e8d1d9
		"--color-error-200": "226 197 208", // #e2c5d0
		"--color-error-300": "209 162 179", // #d1a2b3
		"--color-error-400": "175 93 123", // #af5d7b
		"--color-error-500": "140 23 66", // #8c1742
		"--color-error-600": "126 21 59", // #7e153b
		"--color-error-700": "105 17 50", // #691132
		"--color-error-800": "84 14 40", // #540e28
		"--color-error-900": "69 11 32", // #450b20
		// surface | #9a9a9a 
		"--color-surface-50": "240 240 240", // #f0f0f0
		"--color-surface-100": "235 235 235", // #ebebeb
		"--color-surface-200": "230 230 230", // #e6e6e6
		"--color-surface-300": "215 215 215", // #d7d7d7
		"--color-surface-400": "184 184 184", // #b8b8b8
		"--color-surface-500": "154 154 154", // #9a9a9a
		"--color-surface-600": "139 139 139", // #8b8b8b
		"--color-surface-700": "116 116 116", // #747474
		"--color-surface-800": "92 92 92", // #5c5c5c
		"--color-surface-900": "75 75 75", // #4b4b4b

	}
}

