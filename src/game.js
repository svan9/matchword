function startGAME(urlParams) {
	var finishWord = atob(urlParams.get("word"))
		.split(",")
		.map((e) => ru[e])
		.join("");

	$("main").html(`
    <div class="wordsColumn" data-focus="0" data-complitedchars="" data-oplacechars="">
        <div class="wordRow" id="finishWord" data-length="5"></div>
            ${`<div class="wordRow disabled" data-length="5"></div>`.repeat(5)}
        <info><img src="./source/info.svg"/><label></label></info>
        <div class="button" id="confirm">проверить</div>
    </div>
    <div class="description">ввод букв осуществляется только на киррилице, при вводе с экранной клавиатуры телефона ввод букв осуществляется отдельно</div>
    <div class="message" id="wonMessage">победа</div>
    `);
	var useWords = [];
	var wordInfo = {};

	$("footer").on("click", ".char", async function () {
		const key = this.innerHTML.toLowerCase();
		if (ru.indexOf(key) != -1) {
			try {
				const local = $(".wordsColumn")[0].children.item($(".wordsColumn")[0].dataset.focus);
				if (local.classList.has("disabled")) return;
				const input = [...local.children].filter((c) => c.value.trim() == "");
				input.at(0).focus();
				input.at(0).value = key;
				input.at(1).focus();
			} catch (e) {
				document.activeElement.blur();
			}
		}
	});

	$(".wordsColumn").on("mouseleave", "info", async function (e) {
		var lbl = this.getElementsByTagName("label")[0];
		lbl.innerHTML = "";
	});

	$(".wordsColumn").on("mouseenter", "info", async function (e) {
		var lbl = this.getElementsByTagName("label")[0];
		if (wordInfo.def.length == 0) return;
		lbl.innerHTML = wordInfo.def[0].tr
			.map((e) => e.text)
			.slice(0, 4)
			.join(", ");
	});

	$(".wordsColumn").on("mouseenter", ".wordRow", async function (e) {
		const word = getWordByWordRow(this).toLowerCase();
		if (!(word != "" && this.classList.has("disabled"))) return;
		wordInfo = await getInfoWord(word);
		var st = this.getBoundingClientRect();
		this.style.cursor = "help";

		$(".wordsColumn info").css({
			top: `${st.top + (st.height / 2 - $(".wordsColumn info")[0].getBoundingClientRect().height / 2)}px`,
			left: `${st.left + st.width + 10}px`,
		});

		setTimeout(() => {
			$(".wordsColumn info").css({
				opacity: 1,
			});
		}, 500);
	});
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
			$("#wonMessage").html("слишком короткое слово").addClass("go").addClass("error");
			setTimeout(() => $("#wonMessage").removeClass("go"), 5000);
			return;
		}
		if (!(await wordIsNotExist(word))) {
			$("#wonMessage").html("слово не существует").addClass("go").addClass("error");
			setTimeout(() => $("#wonMessage").removeClass("go"), 5000);
			return;
		}
		if (useWords.indexOf(word) != -1) {
			$("#wonMessage").html("слово уже было использовано").addClass("go").addClass("error");
			setTimeout(() => $("#wonMessage").removeClass("go"), 5000);
			return;
		}

		useWords.push(word);

		[...word].forEach((e, i) => {
			setTimeout(() => {
				if (e == finishWord.at(i)) {
					// true position
					local.children.item(i).classList.add("true_position_char");
					$("#rukb").find(`.char[name=${e}]`).addClass("true_position_char");
				} else if (finishWord.indexOf(e) != -1) {
					// char is exists
					local.children.item(i).classList.add("is_exists_char");
					if ($("#rukb").find(`.char[name=${e}]`).hasClass("true_position_char")) return;
					$("#rukb").find(`.char[name=${e}]`).addClass("is_exists_char");
				} else {
					// char is not exists
					local.children.item(i).classList.add("default_char");
					$("#rukb").find(`.char[name=${e}]`).addClass("default_char");
				}
			}, 100 * i);
		});
		let set = [...new Set([...word].map((e, i) => (e == finishWord.at(i) ? true : false)))];

		local.classList.add("disabled");

		if (set.length == 1 && set[0]) {
			parent.dataset.won = "true";
			$("#wonMessage").attr("class", "message won push").html("победа");
			return;
		}

		parent.dataset.focus++;

		parent.children.item(parent.dataset.focus).classList.remove("disabled");
		if (parent.dataset.focus >= parent.children.length - 2) {
			parent.dataset.won = "true";
			$("#wonMessage").attr("class", "message error push").html("поражение");
			this.classList.add("disabled");
		}
	});
}
