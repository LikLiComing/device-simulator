import { DEVICE_FACTS, presentOperation, README_NETWORK_NOTE, surfaces } from "./compose.js";

const app = document.querySelector("#app");

const nav = surfaces
  .map((surface) => `<a href="#surface-${surface.id}">${surface.title}</a>`)
  .join("");

const sections = surfaces
  .map((surface) => {
    const fields = surface.fields
      .map((item) => {
        const control = item.kind === "bool"
          ? `<select name="${item.name}" id="${surface.id}-${item.name}">
              <option value="false" ${item.value === "false" ? "selected" : ""}>false</option>
              <option value="true" ${item.value === "true" ? "selected" : ""}>true</option>
            </select>`
          : item.name === "scriptArgsText"
            ? `<textarea name="${item.name}" id="${surface.id}-${item.name}">${escapeHtml(item.value)}</textarea>`
            : `<input name="${item.name}" id="${surface.id}-${item.name}" value="${escapeAttr(item.value)}" />`;
        return `<label>${escapeHtml(item.label)}${control}<span class="hint">${escapeHtml(item.hint || "")}</span></label>`;
      })
      .join("");
    const actions = surface.actions
      .map((action) => `<button type="submit" data-action="${action.id}">${escapeHtml(action.label)}</button>`)
      .join("");
    return `<section class="surface" id="surface-${surface.id}" data-family="${surface.id}">
      <h2>${escapeHtml(surface.title)}</h2>
      <p class="blurb">${escapeHtml(surface.blurb)}</p>
      <form data-family="${surface.id}">
        <div class="grid">${fields}</div>
        <div class="actions">${actions}</div>
      </form>
    </section>`;
  })
  .join("");

app.innerHTML = `<div class="wrap">
  <header>
    <h1>设备模拟器操作台</h1>
    <p>把 JetLinks device-simulator 的交互命令摊到一个页面上。提交后看到的是与 CLI 同义的命令，不会连接真实平台。</p>
  </header>
  <div class="facts">
    <article class="card">
      <strong>设备从哪来</strong>
      <p>${escapeHtml(DEVICE_FACTS.note)}</p>
    </article>
    <article class="card">
      <strong class="warn">README 与脚本不一致时</strong>
      <p>MQTT 演示以 benchmark/mqtt/benchmark.js 为准：clientId 是 test-{index}，不是 README 里的 mqtt-test-{index}。</p>
      <p class="hint">${escapeHtml(README_NETWORK_NOTE)}</p>
    </article>
  </div>
  <nav class="nav">${nav}</nav>
  ${sections}
  <section class="result" id="operation-result" aria-live="polite">
    <strong>组包结果</strong>
    <p class="hint">提交任一操作后，这里显示 CLI 命令和脚本契约。</p>
    <pre id="operation-output">等待提交。</pre>
  </section>
</div>`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function readFields(form) {
  const fields = {};
  for (const element of form.elements) {
    if (!element.name || element.type === "submit") {
      continue;
    }
    fields[element.name] = element.value;
  }
  return fields;
}

for (const form of app.querySelectorAll("form")) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const action = submitter ? submitter.dataset.action : form.dataset.family;
    const view = presentOperation({
      family: form.dataset.family,
      action,
      fields: readFields(form),
    });
    const output = document.querySelector("#operation-output");
    output.textContent = view.body;
    document.querySelector("#operation-result").dataset.family = form.dataset.family;
    document.querySelector("#operation-result").dataset.action = action;
    output.scrollIntoView({ block: "nearest" });
  });
}
