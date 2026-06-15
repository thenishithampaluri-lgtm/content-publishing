import "./styles.css";

function showBootError(error) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <main class="auth-screen">
      <section class="auth-panel">
        <p class="eyebrow">Frontend error</p>
        <h1>The app could not load</h1>
        <p class="error">${error?.message || error}</p>
      </section>
    </main>
  `;
}

const bootTimer = window.setTimeout(() => {
  showBootError("React did not start. Open DevTools Console if this continues.");
}, 4000);

Promise.all([
  import("react"),
  import("react-dom/client"),
  import("./App.jsx")
])
  .then(([reactModule, reactDomModule, appModule]) => {
    window.clearTimeout(bootTimer);
    const React = reactModule.default;
    const { createRoot } = reactDomModule;
    const App = appModule.default;

    createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch(showBootError);
