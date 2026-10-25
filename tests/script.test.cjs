const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Проверяем ту же логику, которая запускается браузером, без сторонних пакетов.
const source = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
const context = vm.createContext({
    document: {
        querySelector: () => ({
            replaceChildren() {}, append() {}, addEventListener() {}, textContent: ""
        }),
        createElement: () => ({ append() {}, textContent: "" })
    }
});
vm.runInContext(source, context);

function run(expression) {
    return vm.runInContext(expression, context);
}

function result(expression) {
    return JSON.parse(JSON.stringify(run(expression)));
}

test("семь дней: сумма, максимум, фильтр, доля и среднее", () => {
    const stats = result("analyzeReading(pagesPerDay)");
    assert.equal(stats.totalPages, 290);
    assert.equal(stats.maximumPages, 80);
    assert.deepEqual(stats.highPaceDays, [65, 80, 55]);
    assert.equal(stats.lazyDaysCount, 2);
    assert.equal(stats.lazyDaysShare, 2 / 7);
    assert.equal(stats.averagePages, 290 / 7);
});

test("границы: 20 включается в ленивые, 50 не включается в высокий темп", () => {
    const stats = result("analyzeReading([0, 20, 21, 50, 51])");
    assert.deepEqual(stats.highPaceDays, [51]);
    assert.equal(stats.lazyDaysCount, 2);
    assert.equal(stats.lazyDaysShare, 0.4);
    assert.equal(stats.totalPages, 142);
});

test("нулевая неделя: все дни ленивые, нет деления на ноль", () => {
    const stats = result("analyzeReading([0, 0, 0, 0, 0, 0, 0])");
    assert.equal(stats.totalPages, 0);
    assert.equal(stats.maximumPages, 0);
    assert.equal(stats.averagePages, 0);
    assert.equal(stats.lazyDaysShare, 1);
    assert.deepEqual(stats.highPaceDays, []);
});

test("пустой массив обрабатывается отдельно", () => {
    const stats = result("analyzeReading([])");
    assert.equal(stats.maximumPages, null);
    assert.equal(stats.averagePages, 0);
    assert.equal(stats.lazyDaysShare, 0);
    assert.equal(stats.totalPages, 0);
});

test("поиск максимума, фильтрация и сумма не меняют исходный массив", () => {
    const values = [80, 20, 50, 0, 51, 5];
    context.testValues = values;
    assert.equal(run("findMaximum(testValues)"), 80);
    assert.equal(run("sumPages(testValues)"), 206);
    assert.deepEqual(result("filterHighPaceDays(testValues)"), [80, 51]);
    assert.deepEqual(values, [80, 20, 50, 0, 51, 5]);
});

test("сообщение о темпе: строго больше 40, а не равно 40", () => {
    const messages = [];
    context.console = { log: (...args) => messages.push(args.join(" ")) };
    run("logReadingStatistics([40, 40, 40, 40, 40], analyzeReading([40, 40, 40, 40, 40]))");
    assert.equal(messages.includes("Отличный темп чтения!"), false);
    run("logReadingStatistics(pagesPerDay, analyzeReading(pagesPerDay))");
    assert.equal(messages.includes("Отличный темп чтения!"), true);
});
