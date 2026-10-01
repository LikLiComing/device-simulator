import assert from "node:assert/strict";
import test from "node:test";
import { composeOperation, defaultsFor, presentOperation, PROTOCOLS, surfaces } from "./compose.js";

const SINGLE_PROTOCOLS = ["mqtt", "tcp", "udp", "http", "coap", "coap-tcp"];
const BENCHMARK_ACTIONS = ["start", "stats", "stop", "reload", "select"];
const SINGLE_ACTIONS = ["create", "attach", "send", "close"];

function fields(surfaceId, overrides = {}) {
  return { ...defaultsFor(surfaceId), ...overrides };
}

test("surfaces cover every CLI operation family", () => {
  const ids = surfaces.map((item) => item.id);
  assert.deepEqual(ids.filter((id) => !id.startsWith("benchmark-")).sort(), ["coap", "coap-tcp", "exec", "http", "list", "mqtt", "tcp", "udp"].sort());
  for (const protocol of SINGLE_PROTOCOLS) {
    const single = surfaces.find((item) => item.id === protocol);
    const bench = surfaces.find((item) => item.id === `benchmark-${protocol}`);
    assert.ok(single, protocol);
    assert.ok(bench, `benchmark-${protocol}`);
    assert.deepEqual(single.actions.map((item) => item.id), SINGLE_ACTIONS);
    assert.deepEqual(bench.actions.map((item) => item.id), BENCHMARK_ACTIONS);
  }
  assert.ok(surfaces.some((item) => item.id === "list"));
  assert.ok(surfaces.some((item) => item.id === "exec"));
});

test("mqtt benchmark follows the script, not the README clientId sentence", () => {
  const operation = composeOperation({
    family: "benchmark-mqtt",
    action: "start",
    fields: fields("benchmark-mqtt", {
      size: "5000",
      name: "mqtt",
      host: "127.0.0.1",
      port: "1883",
      script: "benchmark/mqtt/benchmark.js",
      clientId: "mqtt-simulator-{index}",
      username: "mqtt-simulator",
      password: "mqtt-simulator",
      scriptArgsText: "deviceIdPrefix=mqtt-test-",
    }),
  });
  assert.equal(operation.createsPlatformDevices, false);
  assert.equal(operation.readsExistingDeviceList, false);
  assert.equal(operation.sequentialIdsAreDemoRuleOnly, true);
  assert.match(operation.command, /^benchmark mqtt /);
  assert.match(operation.command, /--size=5000\b/);
  assert.match(operation.command, /--name=mqtt\b/);
  assert.match(operation.command, /--host=127\.0\.0\.1\b/);
  assert.match(operation.command, /--port=1883\b/);
  assert.match(operation.command, /--script=benchmark\/mqtt\/benchmark\.js\b/);
  assert.match(operation.command, /--clientId=mqtt-simulator-\{index\}/);
  assert.match(operation.command, /deviceIdPrefix=mqtt-test-/);
  assert.equal(operation.flags.host, "127.0.0.1");
  assert.equal(operation.flags.port, "1883");
  assert.equal(operation.flags.size, "5000");
  assert.equal(operation.flags.script, "benchmark/mqtt/benchmark.js");
  assert.equal(operation.scriptArgs.deviceIdPrefix, "mqtt-test-");
  assert.equal(operation.contract.usingBundledScript, true);
  assert.equal(operation.contract.clientIdRule, "test-{index}");
  assert.equal(operation.contract.username, "test");
  assert.equal(operation.contract.password, "test");
  assert.equal(operation.contract.productId, "simulator");
  assert.equal(operation.contract.topic, "/{productId}/{deviceId}/properties/report");
  assert.equal(operation.contract.report, "false");
  assert.equal(operation.contract.reportLimit, "100");
  assert.equal(operation.contract.interval, "600");
  assert.equal(operation.contract.deviceIdPrefixUsedByScript, false);
  assert.match(operation.contract.readmeMismatch, /mqtt-test-\{index\}/);
  assert.match(operation.contract.readmeMismatch, /deviceIdPrefix/);
  assert.match(operation.followUp, /benchmark stats mqtt/);
  const view = presentOperation({
    family: "benchmark-mqtt",
    action: "start",
    fields: fields("benchmark-mqtt", { host: "10.0.0.8", size: "3" }),
  });
  assert.match(view.headline, /--host=10\.0\.0\.8/);
  assert.match(view.headline, /--size=3\b/);
  assert.match(view.body, /test-\{index\}/);
  assert.match(view.body, /不在平台创建或导入设备/);
});

test("tcp and udp benchmarks keep id template, secureKey and binary protocol", () => {
  const tcp = composeOperation({
    family: "benchmark-tcp",
    action: "start",
    fields: fields("benchmark-tcp", {
      size: "1",
      id: "tcp-test-{index}",
      name: "tcp",
      host: "127.0.0.1",
      port: "8801",
      script: "benchmark/tcp/benchmark.js",
      interface: "192.168.1.8",
      scriptArgsText: "secureKey=test",
    }),
  });
  assert.match(tcp.command, /benchmark tcp /);
  assert.match(tcp.command, /--id=tcp-test-\{index\}/);
  assert.match(tcp.command, /--host=127\.0\.0\.1/);
  assert.match(tcp.command, /--port=8801/);
  assert.match(tcp.command, /--script=benchmark\/tcp\/benchmark\.js/);
  assert.match(tcp.command, /--interface=192\.168\.1\.8/);
  assert.equal(tcp.flags.interface, "192.168.1.8");
  assert.equal(tcp.contract.secureKey, "test");
  assert.equal(tcp.contract.protocolFile, "benchmark/jetlinks-binary-protocol.js");
  assert.match(presentOperation({ family: "benchmark-tcp", action: "start", fields: fields("benchmark-tcp") }).body, /jetlinks-binary-protocol\.js/);
  assert.equal(tcp.contract.report, "true");
  assert.equal(tcp.createsPlatformDevices, false);

  const udp = composeOperation({
    family: "benchmark-udp",
    action: "start",
    fields: fields("benchmark-udp"),
  });
  assert.match(udp.command, /benchmark udp /);
  assert.match(udp.command, /--script=benchmark\/udp\/benchmark\.js/);
  assert.equal(udp.contract.secureKey, "test");
  assert.equal(udp.contract.protocolFile, "benchmark/jetlinks-binary-protocol.js");
  assert.match(udp.contract.notes.join("\n"), /benchmark udp/);
});

test("http and coap benchmarks keep script auth and paths", () => {
  const http = composeOperation({
    family: "benchmark-http",
    action: "start",
    fields: fields("benchmark-http", {
      url: "http://127.0.0.1:8801",
      script: "benchmark/http/benchmark.js",
      ssl: "true",
    }),
  });
  assert.match(http.command, /benchmark http /);
  assert.match(http.command, /--url=http:\/\/127\.0\.0\.1:8801/);
  assert.match(http.command, /--ssl\b/);
  assert.equal(http.flags.ssl, "true");
  assert.equal(http.flags.url, "http://127.0.0.1:8801");
  assert.equal(http.contract.productId, "http-test");
  assert.equal(http.contract.idPrefix, "http-test-");
  assert.equal(http.contract.authorization, "Bearer test");
  assert.equal(http.contract.method, "POST");
  assert.equal(http.contract.topic, "/{productId}/{deviceId}/properties/report");
  assert.equal(http.contract.secureKeyFromArgs, false);

  const coap = composeOperation({
    family: "benchmark-coap",
    action: "start",
    fields: fields("benchmark-coap", { url: "coap://192.168.32.180:8809" }),
  });
  assert.match(coap.command, /benchmark coap /);
  assert.match(coap.command, /--url=coap:\/\/192\.168\.32\.180:8809/);
  assert.equal(coap.contract.secureKey, "testtesttesttest");
  assert.equal(coap.contract.secureKey.length, 16);
  assert.equal(coap.contract.encryption, "AES/ECB/PKCS5Padding");
  assert.equal(PROTOCOLS.coap.secureKeyLength, 16);
});

test("benchmark session commands are stats, stop, reload and select", () => {
  const stats = composeOperation({
    family: "benchmark-mqtt",
    action: "stats",
    fields: { name: "mqtt" },
  });
  assert.deepEqual(stats.steps, ["benchmark stats mqtt"]);

  const stop = composeOperation({
    family: "benchmark-tcp",
    action: "stop",
    fields: { name: "tcp" },
  });
  assert.deepEqual(stop.steps, ["benchmark stats tcp", "stop"]);

  const reload = composeOperation({
    family: "benchmark-udp",
    action: "reload",
    fields: { name: "udp", script: "benchmark/udp/benchmark.js", scriptArgsText: "secureKey=test" },
  });
  assert.equal(reload.steps[0], "benchmark stats udp");
  assert.match(reload.steps[1], /^reload /);
  assert.match(reload.steps[1], /--script=benchmark\/udp\/benchmark\.js/);
  assert.match(reload.steps[1], /--name=udp/);
  assert.match(reload.steps[1], /secureKey=test/);

  const select = composeOperation({
    family: "benchmark-http",
    action: "select",
    fields: { name: "http", expression: "type='http'", limit: "20", offset: "0" },
  });
  assert.equal(select.steps[0], "benchmark stats http");
  assert.match(select.steps[1], /^select /);
  assert.match(select.steps[1], /-e /);
  assert.match(select.steps[1], /-l 20/);
  assert.match(select.steps[1], /-o 0/);
  assert.equal(select.createsPlatformDevices, false);
});

test("single-connection families compose create, attach, send and close", () => {
  const mqtt = composeOperation({
    family: "mqtt",
    action: "create",
    fields: fields("mqtt", {
      host: "127.0.0.1",
      port: "1883",
      clientId: "lab-device-1",
      username: "test",
      password: "test",
      interface: "192.168.1.8",
      ssl: "false",
    }),
  });
  assert.match(mqtt.command, /^mqtt connect /);
  assert.match(mqtt.command, /--host=127\.0\.0\.1/);
  assert.match(mqtt.command, /--port=1883/);
  assert.match(mqtt.command, /--clientId=lab-device-1/);
  assert.match(mqtt.command, /--username=test/);
  assert.match(mqtt.command, /--password=test/);
  assert.match(mqtt.command, /--interface=192\.168\.1\.8/);
  assert.match(mqtt.command, /--ssl=false/);
  assert.equal(mqtt.flags.clientId, "lab-device-1");
  assert.equal(mqtt.createsPlatformDevices, false);

  const attach = composeOperation({ family: "mqtt", action: "attach", fields: { clientId: "lab-device-1" } });
  assert.equal(attach.command, "mqtt attach lab-device-1");

  const send = composeOperation({
    family: "mqtt",
    action: "send",
    fields: { clientId: "lab-device-1", topic: "/simulator/lab-device-1/properties/report", qos: "1", payload: "{\"temp0\":21}" },
  });
  assert.match(send.directCommand, /mqtt publish --clientId=lab-device-1/);
  assert.match(send.directCommand, /--topic=\/simulator\/lab-device-1\/properties\/report/);
  assert.match(send.steps[1], /^publish /);

  const close = composeOperation({ family: "mqtt", action: "close", fields: { clientId: "lab-device-1" } });
  assert.deepEqual(close.steps, ["mqtt attach lab-device-1", "disconnect"]);

  const tcp = composeOperation({
    family: "tcp",
    action: "create",
    fields: { id: "tcp-test-0", host: "127.0.0.1", port: "8801", lengthField: "0,4" },
  });
  assert.match(tcp.command, /tcp connect --id=tcp-test-0 --host=127\.0\.0\.1 --port=8801/);
  assert.match(tcp.command, /--lengthField=0,4/);
  const tcpSend = composeOperation({ family: "tcp", action: "send", fields: { id: "tcp-test-0", payload: "0x0102" } });
  assert.match(tcpSend.directCommand, /tcp send --id=tcp-test-0 0x0102/);
  assert.deepEqual(
    composeOperation({ family: "tcp", action: "close", fields: { id: "tcp-test-0" } }).steps,
    ["tcp attach tcp-test-0", "disconnect"],
  );

  const udp = composeOperation({
    family: "udp",
    action: "create",
    fields: { id: "udp-client", host: "127.0.0.1", port: "8806", interface: "192.168.1.8" },
  });
  assert.match(udp.command, /udp create --id=udp-client --host=127\.0\.0\.1 --port=8806 --interface=192\.168\.1\.8/);
  const udpSend = composeOperation({
    family: "udp",
    action: "send",
    fields: { id: "udp-client", host: "10.0.0.2", port: "9000", payload: "0x0A" },
  });
  assert.match(udpSend.steps[1], /send --host=10\.0\.0\.2 --port=9000 0x0A/);
  assert.equal(composeOperation({ family: "udp", action: "close", fields: { id: "udp-client" } }).steps[1], "close");

  const http = composeOperation({
    family: "http",
    action: "create",
    fields: { id: "http-client", url: "http://127.0.0.1:8801", ssl: "true" },
  });
  assert.match(http.command, /http create --id=http-client/);
  assert.match(http.command, /http:\/\/127\.0\.0\.1:8801/);
  assert.match(http.command, /--ssl\b/);
  const httpSend = composeOperation({
    family: "http",
    action: "send",
    fields: { id: "http-test-0", method: "POST", path: "/http-test/http-test-0/properties/report", data: "{}", mediaType: "application/json" },
  });
  assert.match(httpSend.steps[0], /http attach http-test-0/);
  assert.match(httpSend.steps[1], /request --method=POST/);
  assert.match(httpSend.steps[1], /--data=\{\}/);
  assert.match(httpSend.steps[1], /\/http-test\/http-test-0\/properties\/report/);

  const coap = composeOperation({
    family: "coap",
    action: "create",
    fields: { id: "coap-client", url: "coap://127.0.0.1:5683", interface: "192.168.1.8" },
  });
  assert.match(coap.command, /coap create --id=coap-client --interface=192\.168\.1\.8 coap:\/\/127\.0\.0\.1:5683/);
  const coapSend = composeOperation({
    family: "coap",
    action: "send",
    fields: { id: "coap_0", method: "POST", path: "/properties/report", data: "{}", format: "application/json" },
  });
  assert.match(coapSend.steps[1], /request --method=POST/);
  assert.match(coapSend.steps[1], /--format=application\/json/);
  assert.equal(composeOperation({ family: "coap", action: "close", fields: { id: "coap_0" } }).steps[1], "close");

  const coapTcp = composeOperation({
    family: "coap-tcp",
    action: "create",
    fields: { id: "coap-tcp-client", url: "coap://127.0.0.1:5683" },
  });
  assert.match(coapTcp.command, /coap-tcp create --id=coap-tcp-client coap:\/\/127\.0\.0\.1:5683/);
  assert.match(
    composeOperation({ family: "coap-tcp", action: "attach", fields: { id: "coap-tcp-client" } }).command,
    /coap-tcp attach coap-tcp-client/,
  );
  assert.equal(
    composeOperation({ family: "coap-tcp", action: "close", fields: { id: "coap-tcp-client" } }).steps[1],
    "close",
  );
  const coapTcpBench = composeOperation({
    family: "benchmark-coap-tcp",
    action: "start",
    fields: fields("benchmark-coap-tcp", { url: "coap://127.0.0.1:5683", size: "2" }),
  });
  assert.match(coapTcpBench.command, /benchmark coap-tcp /);
  assert.match(coapTcpBench.command, /--url=coap:\/\/127\.0\.0\.1:5683/);
  assert.match(coapTcpBench.command, /--size=2\b/);
  assert.equal(coapTcpBench.createsPlatformDevices, false);
});

test("list and exec do not read a platform device inventory", () => {
  const list = composeOperation({
    family: "list",
    action: "list",
    fields: { expression: "type='mqtt'", limit: "20", offset: "0" },
  });
  assert.match(list.command, /^list /);
  assert.match(list.command, /-e /);
  assert.equal(list.readsExistingDeviceList, false);
  assert.match(list.contract.notes.join("\n"), /不是平台设备清单/);

  const exec = composeOperation({
    family: "exec",
    action: "exec",
    fields: { file: "benchmark/tcp/benchmark.js" },
  });
  assert.equal(exec.command, "exec --file=benchmark/tcp/benchmark.js");
  assert.equal(exec.flags.file, "benchmark/tcp/benchmark.js");
  assert.equal(exec.createsPlatformDevices, false);
});
