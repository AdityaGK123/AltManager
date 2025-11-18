# Contributing to ALT Manager

Thank you for your interest in contributing to ALT Manager! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/alt-manager.git`
3. Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) to set up your development environment
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Code Style

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible
- Use meaningful variable and function names

### React
- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing
- Follow the existing component structure

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system (colors, spacing, etc.)
- Ensure responsive design (mobile-first)
- Test on multiple screen sizes

## Commit Messages

Follow conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(chat): add voice input support
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the README.md if needed
5. Request review from maintainers

### PR Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers/devices
- [ ] Commits follow conventional format

## Adding New Features

### Adding a New Page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update navigation in `client/src/components/Layout.tsx`
4. Add API endpoints if needed

### Adding API Endpoints
1. Create route file in `server/src/routes/`
2. Register route in `server/src/index.ts`
3. Add API function in `client/src/lib/api.ts`
4. Update types if needed

### Adding Manager Moments
1. Add scenario to `server/src/db/seed.ts`
2. Run seed script: `cd server && npx tsx src/db/seed.ts`
3. Test the scenario in the UI

## Testing

### Manual Testing
- Test all user flows
- Check responsive design
- Verify error handling
- Test with different user roles

### Browser Testing
- Chrome/Edge (primary)
- Firefox
- Safari (if possible)
- Mobile browsers

## Code Review Guidelines

When reviewing PRs:
- Check for code quality and style
- Verify functionality works as expected
- Look for potential bugs or edge cases
- Ensure documentation is updated
- Test the changes locally

## Questions or Issues?

- Open an issue for bugs or feature requests
- Use discussions for questions
- Tag maintainers for urgent issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
