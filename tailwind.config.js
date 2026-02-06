/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        fire: '#ef4444',
        ice: '#3b82f6',
        poison: '#22c55e',
        lightning: '#eab308',
        burn: '#f97316',
        heal: '#a855f7',
        stun: '#6b7280',
        dungeon: {
          900: '#0c0f14',
          800: '#131721',
          700: '#1a1f2e',
          600: '#232a3b',
          500: '#2e3750',
          400: '#3d4966',
          300: '#5a6a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'dice-roll': 'diceRoll 0.6s ease-out',
        'damage-pop': 'damagePop 1s ease-out forwards',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        // Changed: New conveyor-specific animations
        'conveyor-track': 'conveyorTrack 2s linear infinite',
        'conveyor-enter': 'conveyorEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'conveyor-idle': 'conveyorIdle 3s ease-in-out infinite',
        'danger-pulse': 'dangerPulse 1.5s ease-in-out infinite',
        'danger-glow': 'dangerGlow 1.5s ease-in-out infinite',
        'chevron-1': 'chevronFlow 1.5s ease-in-out infinite',
        'chevron-2': 'chevronFlow 1.5s ease-in-out 0.2s infinite',
        'chevron-3': 'chevronFlow 1.5s ease-in-out 0.4s infinite',
      },
      keyframes: {
        diceRoll: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg) scale(0.5)', opacity: '0' },
          '50%': { transform: 'rotateX(180deg) rotateY(180deg) scale(1.2)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg) scale(1)', opacity: '1' },
        },
        damagePop: {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '1' },
          '50%': { transform: 'translateY(-30px) scale(1.3)', opacity: '1' },
          '100%': { transform: 'translateY(-60px) scale(0.8)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Changed: Conveyor track scrolling animation
        conveyorTrack: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(42px)' },
        },
        // Changed: New die entrance animation with bounce
        conveyorEnter: {
          '0%': { transform: 'translateX(-30px) scale(0.6)', opacity: '0' },
          '60%': { transform: 'translateX(4px) scale(1.05)', opacity: '1' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        // Changed: Subtle idle floating for conveyor dice
        conveyorIdle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        // Changed: Danger slot pulse for dice about to fall off
        dangerPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        // Changed: Danger glow ring animation
        dangerGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        // Changed: Chevron flow for direction indicator
        chevronFlow: {
          '0%, 100%': { opacity: '0.3', transform: 'translateX(0)' },
          '50%': { opacity: '1', transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
}