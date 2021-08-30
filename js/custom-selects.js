const customSelects = document.querySelectorAll(".cs");

const config = {
	legends: {
		checkAll: "Marcar todos",
		uncheckAll: "Desmarcar todos",
		selecteds: "selecionados",
	},
};

function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function htmlToElement(html) {
	const template = document.createElement("template");
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

customSelects.forEach((select) => {
	let options = [];
	select.querySelectorAll("option").forEach((option) => {
		options.push({
			value: option.value,
			label: option.innerText,
		});
	});

	const inputName = select.getAttribute("name");
	select.removeAttribute("name");
	select.style.display = "none";
	const placeHolder = select.getAttribute("placeholder")
		? select.getAttribute("placeholder")
		: "";
	const containerId = inputName + "Container";
	const hiddenInputId = inputName + "Input";
	const searchInputId = inputName + "Search";
	const feedbackId = inputName + "Feedback";
	const tableLines = options.reduce((trs, tr) => {
		return (
			trs +
			`<tr>
							<td><label for="${inputName}${tr.value}">${tr.label}</label></td>
							<td style="text-align: right"><input data-cs-value="${tr.value}" type="checkbox" id="${inputName}${tr.value}" /></td>
						</tr>`
		);
	}, "");
	const containerStringHtml = `
					<div style="display: inline-block">
						<input type="search" placeholder="${placeHolder}" id="${searchInputId}" />
						<input type="hidden" name="${inputName}" id="${hiddenInputId}" />
						<div id="${containerId}" class="cs-container">
							<div class="cs-actions">
								<p class="cs-feedback" id="${feedbackId}">0 ${config.legends.selecteds}</p>
								<button type="button" class="cs-mark-all" data-mark="1" title="${config.legends.checkAll}">
									&#9745;
								</button>
							</div>
							<div class="cs-table-wrap">
								<table class="cs-table">
									${tableLines}
								</table>
							</div>
						</div>
					</div>
				`;
	insertAfter(htmlToElement(containerStringHtml), select);
	const hiddenInput = document.querySelector(`#${hiddenInputId}`);
	document.querySelector(`#${searchInputId}`).onfocus = () =>
		document.querySelector(`#${searchInputId}`).click();

	document.querySelector(`#${searchInputId}`).onclick = function (event) {
		event.stopPropagation();
		const inputSearchElement = this;
		const { width } = getComputedStyle(inputSearchElement);
		const feedback = document.querySelector(`#${feedbackId}`);
		const table = document.querySelector(`#${containerId} table`);
		const container = document.querySelector(`#${containerId}`);
		container.style.minWidth = width;
		let selecteds = [];

		container.querySelector(".cs-mark-all").onclick = function (event) {
			selecteds = [];
			if (this.dataset.mark) {
				table.querySelectorAll("input").forEach((item) => {
					this.innerHTML = "&#9744;";
					this.setAttribute("title", config.legends.uncheckAll);
					item.checked = true;
					selecteds.push(parseInt(item.dataset.csValue));
					item.parentElement.parentElement.classList.add(
						"cs-selected"
					);
				});
			} else {
				table.querySelectorAll("input").forEach((item) => {
					this.innerHTML = "&#9745;";
					this.setAttribute("title", config.legends.checkAll);
					item.checked = false;
					item.parentElement.parentElement.classList.remove(
						"cs-selected"
					);
				});
			}
			feedback.innerText = `${selecteds.length} ${config.legends.selecteds}`;
			hiddenInput.value = selecteds;
			this.dataset.mark = !!this.dataset.mark ? "" : "1";
		};

		if (hiddenInput.value) {
			selecteds = JSON.parse(`[${hiddenInput.value}]`);
		}

		inputSearchElement.onsearch = searchTable;
		inputSearchElement.onkeyup = searchTable;

		container.style.display = "block";

		function hideCs() {
			container.style.display = "none";
		}

		function handleClickWindow(event) {
			if (!container.contains(event.target)) {
				hideCs();
				window.removeEventListener("click", handleClickWindow);
				inputSearchElement.value = "";
				table
					.querySelectorAll("tr")
					.forEach((item) => (item.style.display = ""));
			}
		}

		table.querySelectorAll("input").forEach((item) => {
			item.onclick = () => {
				const index = selecteds.indexOf(parseInt(item.dataset.csValue));
				if (index !== -1) {
					selecteds.splice(index, 1);
				} else {
					selecteds.push(parseInt(item.dataset.csValue));
				}
				hiddenInput.value = selecteds;
				item.parentElement.parentElement.classList.toggle(
					"cs-selected"
				);
				feedback.innerText = `${selecteds.length} ${config.legends.selecteds}`;
			};
		});

		window.addEventListener("click", handleClickWindow);

		function searchTable() {
			let input, filter, tr, td, i, txtValue;
			input = inputSearchElement;
			filter = input.value.toUpperCase();
			tr = table.getElementsByTagName("tr");

			for (i = 0; i < tr.length; i++) {
				td = tr[i].getElementsByTagName("td")[0];
				txtValue = td.textContent || td.innerText;
				if (txtValue.toUpperCase().indexOf(filter) > -1) {
					tr[i].style.display = "";
				} else {
					tr[i].style.display = "none";
				}
			}
		}
	};
});
