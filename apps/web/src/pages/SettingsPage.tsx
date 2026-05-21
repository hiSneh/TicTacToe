import { themes } from '@tictactoe/ui';
import { useSettingsStore } from '../store/settingsStore';

export const SettingsPage = () => {
  const { haptics, highContrast, sound, theme, setTheme, toggleHaptics, toggleHighContrast, toggleSound } = useSettingsStore();

  return (
    <section className="glass rounded-[2rem] p-6">
      <h1 className="text-4xl font-black">Settings</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Object.values(themes).map((item) => (
          <button
            key={item.id}
            onClick={() => setTheme(item.id)}
            className={`rounded-2xl border p-5 text-left transition ${
              theme === item.id ? 'border-aqua bg-aqua/12' : 'border-white/10 bg-white/6'
            }`}
          >
            <span className="block size-8 rounded-full" style={{ backgroundColor: item.accent }} />
            <span className="mt-4 block text-xl font-black">{item.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ['Sound', sound, toggleSound],
          ['Haptics', haptics, toggleHaptics],
          ['High Contrast', highContrast, toggleHighContrast],
        ].map(([label, enabled, toggle]) => (
          <button key={label as string} onClick={toggle as () => void} className="rounded-2xl bg-white/7 p-5 text-left">
            <span className="text-xl font-black">{label as string}</span>
            <span className={`mt-3 block h-8 w-14 rounded-full p-1 ${enabled ? 'bg-aqua' : 'bg-white/18'}`}>
              <span className={`block size-6 rounded-full bg-ink transition ${enabled ? 'translate-x-6' : ''}`} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
