function startGAME(urlParams) {
    var finishWord = atob(urlParams.get("word"))
        .split(",")
        .map((e) => ru[e])
        .join("");

    $("main").html(`
    <div class="wordsColumn" data-focus="0" data-complitedchars="" data-oplacechars="">
        <div class="wordRow" id="finishWord" data-length="5"></div>
            ${`<div class="wordRow disabled" data-length="5"></div>`.repeat(5)}
        <div class="button" id="confirm">проверить</div>
    </div>
    <div class="description">ввод букв осуществляется только на киррилице, при вводе с экранной клавиатуры телефона ввод букв осуществляется отдельно</div>
    <div class="message error" id="wordNotExist">слово не существует</div>
    <div class="message won" id="wonMessage">победа</div>
    `);
    var useWords = [];

    $(".wordsColumn").on("click", ".button#confirm", async function (e) {
        if (this.classList.has("disabled")) return;
        var parent = e.delegateTarget;
        var local = parent.children.item(parent.dataset.focus);
        if (parent.dataset.won == "true") {
            local.classList.add("disabled");
            return;
        }

        const word = getWordByWordRow(local).toLowerCase();

        if (word.length != Number(local.dataset.length)) {
            $("#wordNotExist").html("слишком короткое слово").addClass("go");
            setTimeout(() => $("#wordNotExist").removeClass("go"), 5000);
            return;
        }
        if (!(await wordIsNotExist(word))) {
            $("#wordNotExist").html("слово не существует").addClass("go");
            setTimeout(() => $("#wordNotExist").removeClass("go"), 5000);
            return;
        }
        if (useWords.indexOf(word) != -1) {
            $("#wordNotExist").html("слово уже было использовано").addClass("go");
            setTimeout(() => $("#wordNotExist").removeClass("go"), 5000);
            return;
        }

        useWords.push(word);

        [...word].forEach((e, i) => {
            setTimeout(() => {
                if (e == finishWord.at(i)) {
                    // true position
                    local.children.item(i).classList.add("true_position_char");
                } else if (finishWord.indexOf(e) != -1) {
                    // char is exists
                    local.children.item(i).classList.add("is_exists_char");
                } else {
                    // char is not exists
                    local.children.item(i).classList.add("default_char");
                }
            }, 100 * i);
        });
        let set = [...new Set([...word].map((e, i) => (e == finishWord.at(i) ? true : false)))];

        local.classList.add("disabled");

        if (set.length == 1 && set[0]) {
            parent.dataset.won = "true";
            $("#wonMessage").addClass("push");
            return;
        }
        console.log(parent.dataset.focus, parent.children.length);
        parent.dataset.focus++;

        parent.children.item(parent.dataset.focus).classList.remove("disabled");
        if (parent.dataset.focus >= parent.children.length - 1) {
            parent.dataset.won = "true";
            $("#wonMessage").addClass("push");
            $("#wonMessage").addClass("error");
            $("#wonMessage").html("проигрыш");

            this.classList.add("disabled");
        }
    });
}
