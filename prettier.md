Perfecto, vamos a dejar bien claros los pasos para configurar **Prettier** junto con **ESLint** en un proyecto de **React + TypeScript creado con Vite**, **sin conflictos**, y usando la nueva sintaxis moderna de `eslint.config.js`.

Ya que Vite con la plantilla de React+TS ya trae ESLint moderno (`eslint.config.js`), vamos a complementarlo con **Prettier** y **eslint-plugin-prettier**.

---

### ✅ 1. Instalar dependencias necesarias

Abre tu terminal en el proyecto y ejecuta:

```bash
npm install -D prettier eslint-plugin-prettier
```

> Nota: `eslint-plugin-prettier` **integra Prettier a ESLint** como una regla (`prettier/prettier`), para que ESLint pueda mostrar errores si el código no está formateado como Prettier espera.

---

### ✅ 2. Crear archivo de configuración de Prettier

Crea un archivo llamado `.prettierrc` en la raíz del proyecto (o usa `.prettierrc.json`) con la configuración que prefieras. Ejemplo:

```json
{
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2,
    "arrowParens": "avoid"
}
```

También puedes crear un `.prettierignore`:

```txt
dist
node_modules
```

---

### ✅ 3. Configurar ESLint para Prettier sin conflictos

Ya tienes en tu `eslint.config.js` algo como esto (incluyendo lo que tú añadiste):

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintPluginPrettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'error',
    },
  },
)
```

🔒 Esto asegura que cualquier cosa que Prettier diga que no está formateada bien, será marcado como error por ESLint.

---

### ✅ 4. Usar Prettier desde VS Code (opcional pero recomendado)

1. Instala la extensión **Prettier - Code formatter**.
    
2. Abre tu configuración de usuario (`settings.json`) y añade:
    

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

También puedes agregar un override local en `.vscode/settings.json` del proyecto.

---

### ✅ 5. Ejecutar Prettier y ESLint manualmente (opcional)

Puedes agregar estos scripts en tu `package.json`:

```json
"scripts": {
  "format": "prettier --write .",
  "lint": "eslint . --ext ts,tsx"
}
```

---

### 🎯 Resultado

- ESLint analiza errores de código.
    
- Prettier formatea automáticamente el código.
    
- Conflictos eliminados porque usas `eslint-plugin-prettier`.
    
- El formateo incorrecto será detectado como **error** por ESLint.
    
- Puedes usar VS Code para guardar y autoformatear con Prettier.