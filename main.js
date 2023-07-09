const ru = "абвгдеёжзийклмнопрстуфхцчшщэюяьъыАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯЫЬЪ";
const en = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function offFileName() {
    if (document.location.href.match(new RegExp("index.html")) == null) return;
    document.location.href = document.location.href.replace("index.html", "");
}

function putWordRows() {
    [...$(".wordRow")].forEach(
        (e) => (e.innerHTML += `<input type="text" maxlength="1"></input>`.repeat(e.dataset.length))
    );
    $(".wordRow").on("click", "input", function (e) {
        e.preventDefault();
        if (e.delegateTarget.classList.has("disabled")) return;
        this.setSelectionRange(0, this.value.length);
    });
    function off(e) {
        e.preventDefault();
    }
    $(".wordRow > input").on("dblclick", off);
    $(".wordRow > input").on("dragstart", off);
    $(".wordRow > input").on("dragend", off);
    $(".wordRow > input").on("drag", off);
    $(".wordRow > input").on("drop", off);
    $(".wordRow > input").on("mousemove", off);

    $(".wordRow").on("keydown", "input", function (e) {
        e.preventDefault();
        if (e.delegateTarget.classList.has("disabled")) return;
        if (e.key == "Backspace") {
            e.target.value = "";
            new Promise((res, rej) => {
                res(e.delegateTarget.children.item([...e.delegateTarget.children].indexOf(this) - 1));
            })
                .then((next) => {
                    next.focus(), next.setSelectionRange(0, next.value.length);
                    return next;
                })
                .catch((_) => {});
        } else if (ru.indexOf(e.key) != -1) {
            e.target.value = e.key;
            new Promise((res, rej) => {
                res(e.delegateTarget.children.item([...e.delegateTarget.children].indexOf(this) + 1));
            })
                .then((next) => {
                    next.focus(), next.setSelectionRange(0, next.value.length);
                    return next;
                })
                .catch((_) => {
                    document.activeElement.blur();
                });
        }
    });
}

function getWordByWordRow(row) {
    return [...row.children].reduce((a, e) => a + e.value, "");
}

async function wordIsNotExist(word) {
    const link =
        "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20230705T171302Z.ccadeec9e136544a.76e97b76f5f7ebf3e60f63c8c7d1d11c5829898b&lang=ru-ru&text=" +
        decodeURI(word);
    return await new Promise((res, rej) => {
        fetch(link).then(async (e) => {
            res((await e.json()).def.length != 0);
        });
    });
}

function ruToBase64(string) {}

function pushHTML(name, where) {
    let parent = $(document.createElement("div"));
    parent.attr("from", name);
    parent.load(`./html/${name}.html`);

    $(where).append(parent);
}

window.onload = () => {
    offFileName();
    putWordRows();
};

DOMTokenList.prototype.has = function (item) {
    for (let i of this) if (i == item) return true;
    return false;
};

Array.prototype.has = function (item) {
    if (this.find((e) => e == item) != undefined) return true;
    return false;
};
