function customSelects(params) {
	const config = {
		selector: ".custom-selects",
		legendCheckAll: "Marcar todos",
		legendUncheckAll: "Desmarcar todos",
		legendSelecteds: "selecionados",
		...params,
	};

	const selects = document.querySelectorAll(config.selector);

	function insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(
			newNode,
			referenceNode.nextSibling
		);
	}

	function htmlToElement(html) {
		const template = document.createElement("template");
		html = html.trim();
		template.innerHTML = html;
		return template.content.firstChild;
	}

	selects.forEach((select) => {
		const options = Array.from(select.querySelectorAll("option")).map(
			(option) => {
				return {
					value: option.value,
					label: option.innerText,
				};
			}
		);

		const inputName = select.getAttribute("name");
		select.style.display = "none";
		select.removeAttribute("name");
		const placeHolder = select.getAttribute("placeholder")
			? select.getAttribute("placeholder")
			: "";
		const containerId = inputName + "Container";
		const hiddenInputId = inputName + "Input";
		const searchInputId = inputName + "Search";
		const feedbackId = inputName + "Feedback";
		const labelLines = options.reduce((labels, label) => {
			return (
				labels +
				`<label for="${inputName}${label.value}">${label.label}<input data-cs-value="${label.value}" type="checkbox" id="${inputName}${label.value}" /></label>`
			);
		}, "");
		const containerStringHtml = `
		<div style="display: inline-block">
			<input type="search" placeholder="${placeHolder}" id="${searchInputId}" />
			<input type="hidden" name="${inputName}" id="${hiddenInputId}" />
			<div id="${containerId}" class="cs-container">
				<div class="cs-actions">
					<p class="cs-feedback" id="${feedbackId}">0 ${config.legendSelecteds}</p>
					<button type="button" class="cs-mark-all" data-mark="1" title="${config.legendCheckAll}">
						&#9745;
					</button>
				</div>
				<div class="label-container">
					${labelLines}
				</div>
			</div>
		</div>
	`;
		insertAfter(htmlToElement(containerStringHtml), select);
		const hiddenInput = document.querySelector(`#${hiddenInputId}`);
		document.querySelector(`#${searchInputId}`).onfocus = function () {
			this.value = "";
			this.click();
		};

		document.querySelector(`#${searchInputId}`).onclick = function (event) {
			event.stopPropagation();
			const inputSearchElement = this;
			const { width } = getComputedStyle(inputSearchElement);
			const feedback = document.querySelector(`#${feedbackId}`);
			const labelContainer = document.querySelector(
				`#${containerId} .label-container`
			);
			const container = document.querySelector(`#${containerId}`);
			container.style.minWidth = width;
			let selecteds = [];

			container.querySelector(".cs-mark-all").onclick = function (event) {
				selecteds = [];
				if (this.dataset.mark) {
					labelContainer.querySelectorAll("input").forEach((item) => {
						this.innerHTML = "&#9744;";
						this.setAttribute("title", config.legendUncheckAll);
						item.checked = true;
						selecteds.push(parseInt(item.dataset.csValue));
						item.parentElement.classList.add("cs-selected");
					});
				} else {
					labelContainer.querySelectorAll("input").forEach((item) => {
						this.innerHTML = "&#9745;";
						this.setAttribute("title", config.legendCheckAll);
						item.checked = false;
						item.parentElement.classList.remove("cs-selected");
					});
				}
				feedback.innerText = `${selecteds.length} ${config.legendSelecteds}`;
				const titles = selecteds.map(
					(selected) =>
						options.find((option) => option.value == selected).label
				);
				inputSearchElement.setAttribute("title", titles);
				hiddenInput.value = selecteds;
				this.dataset.mark = !!this.dataset.mark ? "" : "1";
			};

			if (hiddenInput.value) {
				selecteds = JSON.parse(`[${hiddenInput.value}]`);
			}

			inputSearchElement.onsearch = search;
			inputSearchElement.onkeyup = search;

			container.style.display = "block";

			function hideCs() {
				container.style.display = "none";
			}

			function handleClickWindow(event) {
				if (!container.contains(event.target)) {
					hideCs();
					window.removeEventListener("click", handleClickWindow);
					inputSearchElement.value =
						inputSearchElement.getAttribute("title");
					labelContainer
						.querySelectorAll("label")
						.forEach((item) => (item.style.display = ""));
				}
			}

			labelContainer.querySelectorAll("input").forEach((item) => {
				item.onclick = () => {
					const index = selecteds.indexOf(
						parseInt(item.dataset.csValue)
					);
					if (index !== -1) {
						selecteds.splice(index, 1);
					} else {
						selecteds.push(parseInt(item.dataset.csValue));
					}
					hiddenInput.value = selecteds;
					item.parentElement.classList.toggle("cs-selected");
					feedback.innerText = `${selecteds.length} ${config.legendSelecteds}`;

					const titles = selecteds.map(
						(selected) =>
							options.find((option) => option.value == selected)
								.label
					);
					inputSearchElement.setAttribute("title", titles);
				};
			});

			window.addEventListener("click", handleClickWindow);

			function search() {
				let input, filter, label, txtValue;
				input = inputSearchElement;
				filter = input.value.toUpperCase();
				label = labelContainer.getElementsByTagName("label");

				for (let i = 0; i < label.length; i++) {
					txtValue = label[i].textContent || label[i].innerText;
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						label[i].style.display = "";
					} else {
						label[i].style.display = "none";
					}
				}
			}
		};
	});
}

customSelects({ selector: ".cs-new" });
