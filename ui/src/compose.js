/**
 * Shared CLI composition entry used by the dev UI and the contract test.
 * Flag names keep the picocli meanings in simulator-cli. Script facts come
 * from benchmark/*.js; where README.md disagrees, the script wins.
 */

export const DEVICE_FACTS = {
  createsPlatformDevices: false,
  readsExistingDeviceList: false,
  sequentialIdsAreDemoRuleOnly: true,
  note: "模拟器只按脚本规则打开连接，不在平台创建或导入设备，也不读取已有设备清单。连续编号只是演示脚本的写法。",
};

export const README_NETWORK_NOTE =
  "README 常见问题：连接提示 no further information 时，在创建连接或 benchmark 命令上指定网卡 --interface（例如 192.168.x.x）。JVM 参数 -Dsimulator.network-interfaces 是启动时的网卡正则，和这条命令参数不是同一个开关。";

const MQTT_README_MISMATCH =
  "README 写默认 clientId 为 mqtt-test-{index}，并说可以用 deviceIdPrefix=mqtt-test- 修改。benchmark/mqtt/benchmark.js 的 beforeConnect 把 clientId 写死为 test-{index}，username/password 写死为 test/test，deviceIdPrefix 只被声明、没有参与拼 ID。界面跟随脚本。";

export const PROTOCOLS = {
  mqtt: {
    id: "mqtt",
    label: "MQTT",
    script: "benchmark/mqtt/benchmark.js",
    readmeDemo: {
      size: "5000",
      name: "mqtt",
      host: "127.0.0.1",
      port: "1883",
      script: "benchmark/mqtt/benchmark.js",
    },
    clientIdRule: "test-{index}",
    cliClientIdTemplate: "mqtt-simulator-{index}",
    singleClientIdDefault: "mqtt-simulator",
    username: "test",
    password: "test",
    cliUsernameDefault: "mqtt-simulator",
    cliPasswordDefault: "mqtt-simulator",
    productId: "simulator",
    topic: "/{productId}/{deviceId}/properties/report",
    reportDefault: "false",
    reportLimitDefault: "100",
    intervalDefault: "600",
    deviceIdPrefixDefined: "mqtt-test-",
    deviceIdPrefixUsedByScript: false,
    readmeMismatch: MQTT_README_MISMATCH,
    secureKey: null,
    auth: "脚本 beforeConnect 覆盖命令行账号，明文 username=test password=test。MD5 认证代码处于注释状态。",
  },
  tcp: {
    id: "tcp",
    label: "TCP",
    script: "benchmark/tcp/benchmark.js",
    readmeDemo: {
      size: "1",
      id: "tcp-test-{index}",
      name: "tcp",
      host: "127.0.0.1",
      port: "8801",
      script: "benchmark/tcp/benchmark.js",
    },
    idTemplate: "tcp-test-{index}",
    cliIdDefault: "tcp-client-{index}",
    singleIdDefault: "",
    secureKey: "test",
    secureKeyFromArgs: true,
    protocol: "benchmark/jetlinks-binary-protocol.js",
    reportDefault: "true",
    reportLimitDefault: "100",
    intervalDefault: "1000",
    readmeMismatch: "",
    note: "README 的 --id=tcp-test-{index} 就是平台侧设备 ID，例如 tcp-test-0。脚本不改写 id。secureKey 默认 test，对应平台产品密钥。",
  },
  udp: {
    id: "udp",
    label: "UDP",
    script: "benchmark/udp/benchmark.js",
    readmeDemo: {
      size: "1",
      id: "udp-client-{index}",
      name: "udp",
      host: "127.0.0.1",
      port: "8806",
      script: "benchmark/udp/benchmark.js",
    },
    idTemplate: "udp-client-{index}",
    cliIdDefault: "udp-client-{index}",
    singleIdDefault: "udp-client",
    secureKey: "test",
    secureKeyFromArgs: true,
    protocol: "benchmark/jetlinks-binary-protocol.js",
    reportDefault: "true",
    reportLimitDefault: "100",
    intervalDefault: "1000",
    readmeMismatch: "",
    note: "benchmark/udp/benchmark.js 文件头注释仍写成 benchmark tcp，实际 CLI 命令是 benchmark udp。行为与 TCP 脚本相同：引用 JetLinks 二进制协议，secureKey 默认 test，设备 ID 来自 --id。",
  },
  http: {
    id: "http",
    label: "HTTP",
    script: "benchmark/http/benchmark.js",
    readmeDemo: {
      size: "1",
      name: "http",
      url: "http://127.0.0.1:8801",
      script: "benchmark/http/benchmark.js",
    },
    idPrefix: "http-test-",
    cliIdDefault: "http-client-{index}",
    singleIdDefault: "http-client",
    productId: "http-test",
    secureKey: "test",
    secureKeyFromArgs: false,
    authorization: "Bearer test",
    method: "POST",
    topic: "/{productId}/{deviceId}/properties/report",
    reportDefault: "true",
    reportLimitDefault: "100",
    intervalDefault: "1000",
    readmeMismatch: "",
    note: "脚本 beforeConnect 用 deviceIdPrefix + index 作为连接 ID，默认 http-test-0。secureKey 在脚本里写死为 test，不读命令参数。请求是 POST，Authorization 为 Bearer test。",
  },
  coap: {
    id: "coap",
    label: "CoAP",
    script: "benchmark/coap/benchmark.js",
    readmeDemo: {
      size: "1",
      name: "coap",
      url: "coap://127.0.0.1:5683",
      script: "benchmark/coap/benchmark.js",
    },
    idPrefix: "coap_",
    cliIdDefault: "coap-client-{index}",
    singleIdDefault: "coap-client",
    productId: "1829413289229496320",
    secureKey: "testtesttesttest",
    secureKeyLength: 16,
    secureKeyFromArgs: false,
    encryption: "AES/ECB/PKCS5Padding",
    method: "POST",
    topic: "/{productId}/{deviceId}/properties/report",
    reportDefault: "true",
    reportLimitDefault: "1",
    intervalDefault: "3000",
    readmeMismatch: "",
    note: "授权 key 必须是 16 个字符。脚本写死 testtesttesttest，载荷经 AES/ECB/PKCS5Padding 加密后 POST。URL 以 coap:// 或 coaps:// 开头。",
  },
  "coap-tcp": {
    id: "coap-tcp",
    label: "CoAP-TCP",
    script: "",
    readmeDemo: {
      size: "1",
      name: "coap-tcp",
      url: "coap://127.0.0.1:5683",
      script: "",
    },
    cliIdDefault: "coap-tcp-client-{index}",
    singleIdDefault: "coap-tcp-client",
    readmeMismatch: "",
    note: "CLI 有 benchmark coap-tcp 与 coap-tcp create/attach/request/close。仓库没有单独的 coap-tcp 演示脚本；benchmark/coap/benchmark.js 只对应 benchmark coap。",
  },
};

const SINGLE = {
  mqtt: {
    command: "mqtt",
    create: "connect",
    attach: "attach",
    send: "publish",
    close: "disconnect",
    idFlag: "clientId",
  },
  tcp: {
    command: "tcp",
    create: "connect",
    attach: "attach",
    send: "send",
    close: "disconnect",
    idFlag: "id",
  },
  udp: {
    command: "udp",
    create: "create",
    attach: "attach",
    send: "send",
    close: "close",
    idFlag: "id",
  },
  http: {
    command: "http",
    create: "create",
    attach: "attach",
    send: "request",
    close: "close",
    idFlag: "id",
  },
  coap: {
    command: "coap",
    create: "create",
    attach: "attach",
    send: "request",
    close: "close",
    idFlag: "id",
  },
  "coap-tcp": {
    command: "coap-tcp",
    create: "create",
    attach: "attach",
    send: "request",
    close: "close",
    idFlag: "id",
  },
};

function text(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function quote(value) {
  const raw = String(value);
  if (raw === "") {
    return '""';
  }
  if (/[\s"]/.test(raw)) {
    return `"${raw.replace(/"/g, '\\"')}"`;
  }
  return raw;
}

function pushFlag(argv, flags, name, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  flags[name] = String(value);
  argv.push(`--${name}=${quote(value)}`);
}

function pushBool(argv, flags, name, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  const on = value === true || value === "true";
  flags[name] = on ? "true" : "false";
  argv.push(on ? `--${name}` : `--${name}=false`);
}

function scriptArgList(fields) {
  const args = [];
  const raw = fields.scriptArgs;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      if (text(key) && text(value) !== "") {
        args.push([key, String(value)]);
      }
    }
  }
  const extra = text(fields.scriptArgsText);
  if (extra) {
    for (const part of extra.split(/\s+/)) {
      const index = part.indexOf("=");
      if (index > 0) {
        args.push([part.slice(0, index), part.slice(index + 1)]);
      }
    }
  }
  return args;
}

function appendScriptArgs(argv, scriptArgs) {
  for (const [key, value] of scriptArgs) {
    argv.push(`${key}=${quote(value)}`);
  }
}

function connectionId(protocol, fields) {
  const spec = SINGLE[protocol];
  return text(fields[spec.idFlag]) || text(fields.id) || text(fields.clientId);
}

function bundled(protocol, fields) {
  const spec = PROTOCOLS[protocol];
  if (!spec || !spec.script) {
    return false;
  }
  const selected = text(fields.script) || spec.script;
  return selected.replace(/\\/g, "/") === spec.script;
}

function scriptContract(protocol, fields) {
  const spec = PROTOCOLS[protocol];
  if (!spec) {
    return { protocol, usingBundledScript: false, notes: [] };
  }
  const usingBundledScript = bundled(protocol, fields);
  const supplied = Object.fromEntries(scriptArgList(fields));
  const report = supplied.report ?? spec.reportDefault;
  const reportLimit = supplied.reportLimit ?? spec.reportLimitDefault;
  const interval = supplied.interval ?? spec.intervalDefault;
  const notes = [DEVICE_FACTS.note, README_NETWORK_NOTE];
  if (spec.readmeMismatch) {
    notes.push(spec.readmeMismatch);
  }
  if (spec.note) {
    notes.push(spec.note);
  }
  if (spec.auth) {
    notes.push(spec.auth);
  }
  if (protocol === "mqtt" && usingBundledScript) {
    notes.push(
      "使用仓库自带 MQTT 脚本时，--clientId / --username / --password 会被 beforeConnect 覆盖，实际上线 ID 是 test-{index}。",
    );
  }
  if (protocol === "mqtt" && supplied.deviceIdPrefix) {
    notes.push(
      "已把 deviceIdPrefix 作为 CLI 尾部参数保留，但 benchmark/mqtt/benchmark.js 不会用它改 clientId。",
    );
  }
  if (!usingBundledScript && spec.script) {
    notes.push(`当前 --script 不是仓库演示脚本 ${spec.script}，上面的演示默认值不会自动生效。`);
  }
  return {
    protocol,
    usingBundledScript,
    script: spec.script,
    clientIdRule: spec.clientIdRule || "",
    idTemplate: spec.idTemplate || spec.cliIdDefault || "",
    idPrefix: spec.idPrefix || "",
    username: spec.username || "",
    password: spec.password || "",
    productId: supplied.productId || spec.productId || "",
    topic: spec.topic || "",
    secureKey: spec.secureKeyFromArgs === false ? spec.secureKey : supplied.secureKey || spec.secureKey || "",
    secureKeyFromArgs: Boolean(spec.secureKeyFromArgs),
    secureKeyLength: spec.secureKeyLength || 0,
    authorization: spec.authorization || "",
    method: spec.method || "",
    encryption: spec.encryption || "",
    protocolFile: spec.protocol || "",
    report,
    reportLimit,
    interval,
    deviceIdPrefixDefined: spec.deviceIdPrefixDefined || "",
    deviceIdPrefixUsedByScript: spec.deviceIdPrefixUsedByScript === true,
    readmeMismatch: spec.readmeMismatch || "",
    createsPlatformDevices: false,
    readsExistingDeviceList: false,
    sequentialIdsAreDemoRuleOnly: true,
    notes,
  };
}

function benchmarkStart(protocol, fields) {
  const spec = PROTOCOLS[protocol];
  const argv = ["benchmark", protocol];
  const flags = {};
  pushFlag(argv, flags, "host", fields.host);
  pushFlag(argv, flags, "port", fields.port);
  pushFlag(argv, flags, "url", fields.url);
  pushFlag(argv, flags, "id", fields.id);
  pushFlag(argv, flags, "clientId", fields.clientId);
  pushFlag(argv, flags, "username", fields.username);
  pushFlag(argv, flags, "password", fields.password);
  pushFlag(argv, flags, "size", fields.size);
  pushFlag(argv, flags, "index", fields.index);
  pushFlag(argv, flags, "name", fields.name);
  pushFlag(argv, flags, "concurrency", fields.concurrency);
  pushBool(argv, flags, "reconnect", fields.reconnect);
  pushFlag(argv, flags, "script", fields.script);
  pushFlag(argv, flags, "interface", fields.interface);
  pushBool(argv, flags, "ssl", fields.ssl);
  pushFlag(argv, flags, "delimited", fields.delimited);
  pushFlag(argv, flags, "fixedLength", fields.fixedLength);
  pushFlag(argv, flags, "lengthField", fields.lengthField);
  pushFlag(argv, flags, "header", fields.header);
  pushFlag(argv, flags, "shared", fields.shared);
  pushFlag(argv, flags, "option", fields.option);
  pushFlag(argv, flags, "topics", fields.topics);
  const scriptArgs = scriptArgList(fields);
  appendScriptArgs(argv, scriptArgs);
  const name = text(fields.name) || protocol;
  return {
    command: argv.map(String).join(" "),
    argv,
    flags,
    scriptArgs: Object.fromEntries(scriptArgs),
    steps: [argv.map(String).join(" "), `benchmark stats ${quote(name)}`],
    followUp: `benchmark stats ${quote(name)}`,
    contract: scriptContract(protocol, fields),
  };
}

function benchmarkSession(action, fields) {
  const name = text(fields.name);
  const enter = name ? `benchmark stats ${quote(name)}` : "benchmark stats";
  const argv = ["benchmark", "stats"];
  if (name) {
    argv.push(name);
  }
  let session = action;
  const flags = {};
  if (name) {
    flags.name = name;
  }
  if (action === "reload") {
    const sessionArgv = ["reload"];
    pushFlag(sessionArgv, flags, "script", fields.script);
    pushFlag(sessionArgv, flags, "name", fields.name);
    const scriptArgs = scriptArgList(fields);
    appendScriptArgs(sessionArgv, scriptArgs);
    session = sessionArgv.join(" ");
    return {
      command: `${enter}\n${session}`,
      argv,
      sessionArgv,
      flags,
      scriptArgs: Object.fromEntries(scriptArgs),
      steps: [enter, session],
    };
  }
  if (action === "select") {
    const sessionArgv = ["select"];
    const expression = text(fields.expression);
    const limit = text(fields.limit);
    const offset = text(fields.offset);
    if (expression) {
      flags.expression = expression;
      sessionArgv.push("-e", quote(expression));
    }
    if (limit) {
      flags.limit = limit;
      sessionArgv.push("-l", limit);
    }
    if (offset) {
      flags.offset = offset;
      sessionArgv.push("-o", offset);
    }
    session = sessionArgv.join(" ");
    return {
      command: `${enter}\n${session}`,
      argv,
      sessionArgv,
      flags,
      scriptArgs: {},
      steps: [enter, session],
    };
  }
  if (action === "stats") {
    return {
      command: enter,
      argv,
      flags,
      scriptArgs: {},
      steps: [enter],
    };
  }
  return {
    command: `${enter}\n${action}`,
    argv,
    flags,
    scriptArgs: {},
    steps: [enter, action],
  };
}

function singleCreate(protocol, fields) {
  const spec = SINGLE[protocol];
  const argv = [spec.command, spec.create];
  const flags = {};
  pushFlag(argv, flags, "id", fields.id);
  pushFlag(argv, flags, "host", fields.host);
  pushFlag(argv, flags, "port", fields.port);
  pushFlag(argv, flags, "clientId", fields.clientId);
  pushFlag(argv, flags, "username", fields.username);
  pushFlag(argv, flags, "password", fields.password);
  pushFlag(argv, flags, "topics", fields.topics);
  pushFlag(argv, flags, "header", fields.header);
  pushFlag(argv, flags, "option", fields.option);
  pushFlag(argv, flags, "delimited", fields.delimited);
  pushFlag(argv, flags, "fixedLength", fields.fixedLength);
  pushFlag(argv, flags, "lengthField", fields.lengthField);
  pushFlag(argv, flags, "interface", fields.interface);
  pushBool(argv, flags, "ssl", fields.ssl);
  if (text(fields.url)) {
    flags.url = text(fields.url);
    argv.push(quote(fields.url));
  }
  return {
    command: argv.join(" "),
    argv,
    flags,
    scriptArgs: {},
    steps: [argv.join(" ")],
    contract: scriptContract(protocol, { ...fields, script: PROTOCOLS[protocol].script }),
  };
}

function singleAttach(protocol, fields) {
  const spec = SINGLE[protocol];
  const id = connectionId(protocol, fields);
  const command = `${spec.command} ${spec.attach} ${quote(id)}`;
  return {
    command,
    argv: [spec.command, spec.attach, id],
    flags: { [spec.idFlag]: id },
    scriptArgs: {},
    steps: [command],
    contract: scriptContract(protocol, fields),
  };
}

function singleSend(protocol, fields) {
  const spec = SINGLE[protocol];
  const id = connectionId(protocol, fields);
  const attach = `${spec.command} ${spec.attach} ${quote(id)}`;
  if (protocol === "mqtt") {
    const topic = text(fields.topic);
    const qos = text(fields.qos) || "0";
    const payload = text(fields.payload);
    const direct = [
      "mqtt",
      "publish",
      `--clientId=${quote(id)}`,
      `--topic=${quote(topic)}`,
      `--qos=${quote(qos)}`,
      quote(payload),
    ].join(" ");
    const session = `publish --topic=${quote(topic)} --qos=${quote(qos)} ${quote(payload)}`;
    return {
      command: direct,
      argv: ["mqtt", "publish", `--clientId=${id}`, `--topic=${topic}`, `--qos=${qos}`, payload],
      flags: { clientId: id, topic, qos },
      scriptArgs: {},
      steps: [attach, session],
      directCommand: direct,
      contract: scriptContract(protocol, fields),
    };
  }
  if (protocol === "tcp") {
    const payload = text(fields.payload);
    const direct = `tcp send --id=${quote(id)} ${quote(payload)}`;
    return {
      command: direct,
      argv: ["tcp", "send", `--id=${id}`, payload],
      flags: { id, payload },
      scriptArgs: {},
      steps: [attach, `send ${quote(payload)}`],
      directCommand: direct,
      contract: scriptContract(protocol, fields),
    };
  }
  if (protocol === "udp") {
    const payload = text(fields.payload);
    const sessionArgv = ["send"];
    const flags = { id };
    if (text(fields.host)) {
      flags.host = text(fields.host);
      sessionArgv.push(`--host=${quote(fields.host)}`);
    }
    if (text(fields.port)) {
      flags.port = text(fields.port);
      sessionArgv.push(`--port=${quote(fields.port)}`);
    }
    sessionArgv.push(quote(payload));
    const session = sessionArgv.join(" ");
    return {
      command: `${attach}\n${session}`,
      argv: [spec.command, spec.attach, id],
      flags,
      scriptArgs: {},
      steps: [attach, session],
      contract: scriptContract(protocol, fields),
    };
  }
  const method = text(fields.method) || "GET";
  const data = text(fields.data);
  const target = text(fields.path) || text(fields.uri);
  const sessionArgv = ["request", `--method=${quote(method)}`];
  const flags = { id, method };
  if (data) {
    flags.data = data;
    sessionArgv.push(`--data=${quote(data)}`);
  }
  if (protocol === "http") {
    if (text(fields.mediaType)) {
      flags.mediaType = text(fields.mediaType);
      sessionArgv.push(`--mediaType=${quote(fields.mediaType)}`);
    }
    if (text(fields.file)) {
      flags.file = text(fields.file);
      sessionArgv.push(`--file=${quote(fields.file)}`);
    }
    if (text(fields.header)) {
      flags.header = text(fields.header);
      sessionArgv.push(`--header=${quote(fields.header)}`);
    }
  } else if (text(fields.format)) {
    flags.format = text(fields.format);
    sessionArgv.push(`--format=${quote(fields.format)}`);
  }
  if (text(fields.option)) {
    flags.option = text(fields.option);
    sessionArgv.push(`--option=${quote(fields.option)}`);
  }
  if (target) {
    flags.path = target;
    sessionArgv.push(quote(target));
  }
  const session = sessionArgv.join(" ");
  return {
    command: `${attach}\n${session}`,
    argv: [spec.command, spec.attach, id],
    flags,
    scriptArgs: {},
    steps: [attach, session],
    contract: scriptContract(protocol, fields),
  };
}

function singleClose(protocol, fields) {
  const spec = SINGLE[protocol];
  const id = connectionId(protocol, fields);
  const attach = `${spec.command} ${spec.attach} ${quote(id)}`;
  return {
    command: `${attach}\n${spec.close}`,
    argv: [spec.command, spec.attach, id],
    flags: { [spec.idFlag]: id },
    scriptArgs: {},
    steps: [attach, spec.close],
    contract: scriptContract(protocol, fields),
  };
}

function listConnections(fields) {
  const argv = ["list"];
  const flags = {};
  if (text(fields.expression)) {
    flags.expression = text(fields.expression);
    argv.push("-e", quote(fields.expression));
  }
  if (text(fields.limit)) {
    flags.limit = text(fields.limit);
    argv.push("-l", text(fields.limit));
  }
  if (text(fields.offset)) {
    flags.offset = text(fields.offset);
    argv.push("-o", text(fields.offset));
  }
  return {
    command: argv.join(" "),
    argv,
    flags,
    scriptArgs: {},
    steps: [argv.join(" ")],
    contract: {
      ...DEVICE_FACTS,
      notes: [DEVICE_FACTS.note, "list 查询的是模拟器进程里已经建立的连接，不是平台设备清单。"],
      createsPlatformDevices: false,
      readsExistingDeviceList: false,
      sequentialIdsAreDemoRuleOnly: true,
    },
  };
}

function execScript(fields) {
  const file = text(fields.file) || text(fields.script);
  const command = `exec --file=${quote(file)}`;
  return {
    command,
    argv: ["exec", `--file=${file}`],
    flags: { file },
    scriptArgs: {},
    steps: [command],
    contract: {
      ...DEVICE_FACTS,
      notes: [DEVICE_FACTS.note, "exec --file 执行一段 JavaScript，不会注册平台设备。"],
      createsPlatformDevices: false,
      readsExistingDeviceList: false,
      sequentialIdsAreDemoRuleOnly: true,
    },
  };
}

export function composeOperation(input) {
  const family = text(input && input.family);
  const action = text(input && input.action);
  const fields = (input && input.fields) || {};
  let built;
  if (family === "list") {
    built = listConnections(fields);
  } else if (family === "exec") {
    built = execScript(fields);
  } else if (family.startsWith("benchmark-")) {
    const protocol = family.slice("benchmark-".length);
    built = action === "start" ? benchmarkStart(protocol, fields) : benchmarkSession(action, fields);
    if (action !== "start") {
      built.contract = scriptContract(protocol, fields);
    }
  } else if (SINGLE[family]) {
    if (action === "create") {
      built = singleCreate(family, fields);
    } else if (action === "attach") {
      built = singleAttach(family, fields);
    } else if (action === "send") {
      built = singleSend(family, fields);
    } else if (action === "close") {
      built = singleClose(family, fields);
    } else {
      throw new Error(`unsupported action ${action} for ${family}`);
    }
  } else {
    throw new Error(`unsupported family ${family}`);
  }
  return {
    family,
    action,
    createsPlatformDevices: false,
    readsExistingDeviceList: false,
    sequentialIdsAreDemoRuleOnly: true,
    ...built,
  };
}

export function presentOperation(input) {
  const operation = composeOperation(input);
  const lines = [
    operation.command,
    "",
    DEVICE_FACTS.note,
    ...(operation.contract && operation.contract.notes ? operation.contract.notes : []),
  ];
  if (operation.contract && operation.contract.readmeMismatch) {
    lines.push(operation.contract.readmeMismatch);
  }
  return {
    ...operation,
    headline: operation.steps ? operation.steps.join("\n") : operation.command,
    body: lines.filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n"),
  };
}

function field(name, label, value, extra = {}) {
  return { name, label, value: value ?? "", ...extra };
}

function netFields(defaults = {}) {
  return [
    field("interface", "网卡 --interface", defaults.interface || "", { hint: "对应 CLI --interface，例如 192.168.1.8" }),
    field("ssl", "SSL --ssl", defaults.ssl || "false", { kind: "bool" }),
  ];
}

function benchmarkCommon(protocol) {
  const spec = PROTOCOLS[protocol];
  const demo = spec.readmeDemo;
  return [
    field("size", "数量 --size", demo.size || "1", { hint: "要建立的连接数，不是平台创建设备数" }),
    field("index", "起始序号 --index", "0"),
    field("name", "任务名 --name", demo.name || protocol),
    field("concurrency", "建连并发 --concurrency", "8"),
    field("reconnect", "断线重连 --reconnect", "false", { kind: "bool" }),
    field("script", "脚本 --script", demo.script || "", { hint: "仓库演示脚本路径" }),
    field("scriptArgsText", "脚本参数 key=value", protocol === "mqtt" ? "" : "report=true reportLimit=100 interval=1000", {
      hint: "CLI 尾部参数，例如 report=true productId=simulator",
    }),
  ];
}

export const surfaces = [
  {
    id: "list",
    title: "连接列表",
    blurb: "对应顶层命令 list。查的是模拟器里的连接，不是平台设备。",
    actions: [{ id: "list", label: "查询 list" }],
    fields: [
      field("expression", "表达式 -e/--expression", "type='mqtt'"),
      field("limit", "条数 -l/--limit", "20"),
      field("offset", "偏移 -o/--offset", "0"),
    ],
  },
  {
    id: "exec",
    title: "执行脚本",
    blurb: "对应顶层命令 exec --file。",
    actions: [{ id: "exec", label: "执行 exec" }],
    fields: [field("file", "脚本 --file / -f", "benchmark/mqtt/benchmark.js")],
  },
  ...["mqtt", "tcp", "udp", "http", "coap", "coap-tcp"].flatMap((protocol) => {
    const spec = PROTOCOLS[protocol];
    const demo = spec.readmeDemo;
    const singleFields = [
      protocol === "mqtt"
        ? field("clientId", "客户端 ID --clientId", spec.singleClientIdDefault)
        : field("id", "连接 ID --id", spec.singleIdDefault || ""),
      field("host", "主机 --host", demo.host || "127.0.0.1"),
      field("port", "端口 --port", demo.port || ""),
      field("url", "地址 --url / 位置参数", demo.url || ""),
    ];
    if (protocol === "mqtt") {
      singleFields.push(
        field("username", "用户名 --username", spec.cliUsernameDefault),
        field("password", "密码 --password", spec.cliPasswordDefault),
        field("topics", "订阅 --topics", ""),
        field("topic", "发送主题 --topic", "/simulator/mqtt-simulator/properties/report"),
        field("qos", "QoS --qos", "0"),
        field("payload", "载荷", "{\"properties\":{\"temp0\":25}}"),
      );
    }
    if (protocol === "tcp") {
      singleFields.push(
        field("delimited", "分隔符 --delimited", ""),
        field("fixedLength", "定长 --fixedLength", ""),
        field("lengthField", "长度字段 --lengthField", ""),
        field("payload", "发送载荷", "0x010203"),
      );
    }
    if (protocol === "udp") {
      singleFields.push(field("payload", "发送载荷", "0x010203"));
    }
    if (protocol === "http" || protocol === "coap" || protocol === "coap-tcp") {
      singleFields.push(
        field("method", "方法 --method", "GET"),
        field("path", protocol === "http" ? "路径" : "URI", "/"),
        field("data", "数据 --data", ""),
      );
    }
    if (protocol === "http") {
      singleFields.push(field("header", "请求头 --header", ""), field("mediaType", "媒体类型 --mediaType", "application/json"), field("file", "文件 --file", ""));
    }
    if (protocol === "coap" || protocol === "coap-tcp") {
      singleFields.push(field("option", "选项 --option", ""), field("format", "格式 --format", ""));
    }
    singleFields.push(...netFields());
    const benchFields = [...benchmarkCommon(protocol)];
    if (demo.host) {
      benchFields.unshift(field("port", "端口 --port", demo.port || ""), field("host", "主机 --host", demo.host));
    }
    if (demo.url) {
      benchFields.unshift(field("url", "地址 --url", demo.url));
    }
    if (protocol === "tcp" || protocol === "udp") {
      benchFields.unshift(field("id", "设备 ID 模板 --id", demo.id || spec.cliIdDefault));
    }
    if (protocol === "mqtt") {
      benchFields.push(
        field("clientId", "CLI clientId --clientId", spec.cliClientIdTemplate, {
          hint: "自带脚本会覆盖成 test-{index}",
        }),
        field("username", "CLI 用户名 --username", spec.cliUsernameDefault),
        field("password", "CLI 密码 --password", spec.cliPasswordDefault),
      );
    }
    benchFields.push(...netFields());
    if (protocol === "tcp") {
      benchFields.push(field("lengthField", "长度字段 --lengthField", "0,4"));
    }
    return [
      {
        id: protocol,
        title: `${spec.label} 单连接`,
        blurb: `${spec.command || protocol} 的 create/attach/send/close。${spec.note || spec.readmeMismatch || ""}`,
        actions: [
          { id: "create", label: `建立 ${SINGLE[protocol].create}` },
          { id: "attach", label: "附着 attach" },
          { id: "send", label: protocol === "http" || protocol.startsWith("coap") ? "请求 request" : "发送" },
          { id: "close", label: `关闭 ${SINGLE[protocol].close}` },
        ],
        fields: singleFields,
      },
      {
        id: `benchmark-${protocol}`,
        title: `${spec.label} 压测`,
        blurb: `benchmark ${protocol}，以及 stats / stop / reload / select。${spec.readmeMismatch || spec.note || ""}`,
        actions: [
          { id: "start", label: "启动 benchmark" },
          { id: "stats", label: "统计 stats" },
          { id: "stop", label: "停止 stop" },
          { id: "reload", label: "重载 reload" },
          { id: "select", label: "筛选 select" },
        ],
        fields: [
          ...benchFields,
          field("expression", "select 表达式 -e", `type='${protocol === "coap-tcp" ? "coap" : protocol}'`),
          field("limit", "select 条数 -l", "20"),
          field("offset", "select 偏移 -o", "0"),
        ],
      },
    ];
  }),
];

export function defaultsFor(surfaceId) {
  const surface = surfaces.find((item) => item.id === surfaceId);
  const fields = {};
  if (!surface) {
    return fields;
  }
  for (const item of surface.fields) {
    fields[item.name] = item.value;
  }
  return fields;
}
