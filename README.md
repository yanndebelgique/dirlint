# dirlint

A CLI tool to validate and lint directory structures based on configurable rules.

## Features

- ✅ Validate directory structures against defined rules
- ✅ Check for missing required files
- ✅ Detect unwanted files or directories
- ✅ Enforce consistent project architecture
- ✅ Configure rules via `.dirrules.yaml` files

## Installation

### Global installation (recommended)

```bash
npm install -g @yanneman/validate_directory_structure
```

### Local installation

```bash
npm install --save-dev @yanneman/validate_directory_structure
```

## Usage

### Command Line

```bash
# Validate a directory
dirlint <path-to-directory>

# Example
dirlint ./src/components
```

### In package.json scripts

```json
{
  "scripts": {
    "lint:structure": "dirlint ./src"
  }
}
```

## Configuration

Create a `.dirrules.yaml` file in any directory you want to validate:

```yaml
# Example .dirrules.yaml
required_files:
  - index.ts
  - README.md

allowed_files:
  - "*.ts"
  - "*.md"

required_directories:
  - src
  - tests
```

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for detailed examples and use cases.

## License

ISC

## Repository

https://github.com/yanndebelgique/dirlint
