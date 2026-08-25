// Applies the saved theme before first paint so there's no flash of the wrong one.
// Must render inside <head>. Consumers need a `dark` variant in their CSS that keys
// off the `.dark` class on <html>.
export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `if(localStorage.getItem('darkMode')==='enabled')document.documentElement.classList.add('dark')`,
      }}
    />
  );
}
