/**
 * jest.setup.ts — runs before every test file.
 *
 * LEARNING NOTE — What does @testing-library/jest-dom add?
 * Without this import your assertions are limited to plain Jest matchers:
 *   expect(element).not.toBeNull()   ← works but vague
 *
 * After this import you get DOM-specific matchers:
 *   expect(element).toBeInTheDocument()   ← clear: the element exists in the page
 *   expect(input).toHaveValue('UG0001')   ← clear: the input contains this text
 *   expect(button).toBeDisabled()         ← clear: the button cannot be clicked
 */
import '@testing-library/jest-dom';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';
