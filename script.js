"use strict";

// ЛР №4, вариант 10: количество прочитанных страниц за семь дней.
const pagesPerDay = [18, 65, 42, 0, 80, 55, 30];
const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function findMaximum(values) {
    if (values.length === 0) {
        return null;
    }

    let maximum = values[0];
    for (const value of values) {
        if (value > maximum) {
            maximum = value;
        }
    }
    return maximum;
}

function filterHighPaceDays(values) {
    return values.filter(function (pages) {
        return pages > 50;
    });
}

function sumPages(values) {
    let total = 0;
    for (const pages of values) {
        total += pages;
    }
    return total;
}

function analyzeReading(values) {
    const totalPages = sumPages(values);
    let lazyDaysCount = 0;

    // Дни с 20 страницами тоже считаются «ленивыми».
    for (let index = 0; index < values.length; index += 1) {
        if (values[index] <= 20) {
            lazyDaysCount += 1;
        }
    }

    return {
        totalPages: totalPages,
        maximumPages: findMaximum(values),
        highPaceDays: filterHighPaceDays(values),
        lazyDaysCount: lazyDaysCount,
        lazyDaysShare: values.length === 0 ? 0 : lazyDaysCount / values.length,
        averagePages: values.length === 0 ? 0 : totalPages / values.length
    };
}

function formatNumber(value) {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
}

function renderReadingStatistics(values, statistics) {
    const list = document.querySelector("#reading-days");
    list.replaceChildren();

    values.forEach(function (pages, index) {
        const item = document.createElement("li");
        const day = document.createElement("span");
        const amount = document.createElement("strong");
        day.textContent = dayNames[index];
        amount.textContent = pages;
        item.append(day, amount);
        list.append(item);
    });

    const summary = {
        total: statistics.totalPages,
        maximum: statistics.maximumPages,
        average: formatNumber(statistics.averagePages),
        high: statistics.highPaceDays.length,
        lazy: statistics.lazyDaysCount,
        share: formatNumber(statistics.lazyDaysShare * 100) + "%"
    };
    for (const key of Object.keys(summary)) {
        document.querySelector('[data-stat="' + key + '"]').textContent = summary[key];
    }
}

function logReadingStatistics(values, statistics) {
    console.log("Прочитано страниц по дням:", values);
    console.log("Максимум за день:", statistics.maximumPages);
    console.log("Дни с высоким темпом (> 50 страниц):", statistics.highPaceDays);
    console.log("Количество «ленивых» дней:", statistics.lazyDaysCount);
    console.log("Доля «ленивых» дней: " + formatNumber(statistics.lazyDaysShare * 100) + "%");
    console.log("Среднее количество страниц: " + formatNumber(statistics.averagePages));

    if (statistics.averagePages > 40) {
        console.log("Отличный темп чтения!");
    }
}

function runReadingDemo() {
    const enteredName = window.prompt("Как вас зовут?", "");
    const status = document.querySelector("#reading-status");
    if (enteredName === null) {
        status.textContent = "Ввод имени отменён. Статистика остаётся на странице.";
        return;
    }

    const readerName = enteredName.trim() || "читатель";
    window.alert("Привет, " + readerName + "! Посмотрим, как прошла неделя чтения.");

    const statistics = analyzeReading(pagesPerDay);
    window.alert("Всего прочитано " + statistics.totalPages + " страниц, в " + statistics.highPaceDays.length + " днях темп был высоким");
    logReadingStatistics(pagesPerDay, statistics);
    status.textContent = readerName + ", итоги показаны. Подробности доступны в консоли браузера.";
}

function handleFeedback(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.namedItem("name").value.trim() || "читатель";
    document.querySelector("#feedback-status").textContent = "Спасибо, " + name + "! Учебная форма заполнена. Сообщение никуда не отправлено.";
}

const readingStatistics = analyzeReading(pagesPerDay);
renderReadingStatistics(pagesPerDay, readingStatistics);
document.querySelector("#reading-demo").addEventListener("click", runReadingDemo);
document.querySelector("#feedback-form").addEventListener("submit", handleFeedback);
