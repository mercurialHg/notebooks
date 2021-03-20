//polyfills

var helpers = {
    appendElem: function (elem, parent) {
        parent.appendChild(elem);
    },
    hasClass: function (elem, className) {
        var classList = elem.className;
        if (classList.indexOf(className) !== -1) return true;
        return false;
    },
    addClass: function (elem, className) {
        var classNames = elem.className;
        if (!this.hasClass(elem, className)) {
            classNames += " " + className;
            elem.className = classNames;
        }
    },
    removeClass: function (elem, className) {
        var classNames = elem.className;
        if (this.hasClass(elem, className)) {
            classNames = classNames.replace(className, "").trim();
            elem.className = classNames;
        }
    },
    ancestor: function (elem, ancestorSelector) {
        return findAncestor(elem);

        function findAncestor(elem) {
            if (elem.parentElement === null) return null;
            if (elem.matches(ancestorSelector)) return elem;
            else return findAncestor(elem.parentElement);
        }
    }
};
var model = {
    currentTag: "",
    linkMap: {},
    categ: [],
    activeCategories: [],
    linkSelector: ".item__link",
    buttonContainer: ".categ",
    selectMultiple: false,
    multipleSelector: ".page__multiple",
    multipleClass: "js--pressed",
    multipleList: null,
    multipleRegister: function () {
        this.multipleList = document.querySelectorAll(this.multipleSelector);
    },
    updateCateg: function (category) {
        var _ = this,
            index;
        if (_.selectMultiple) {
            if (_.activeCategories.indexOf(category) === -1) {
                _.activeCategories.push(category);
            } else {
                index = _.activeCategories.indexOf(category);
                _.activeCategories.splice(index, 1);
            }
        } else {
            if (_.activeCategories.indexOf(category) === -1) {
                _.activeCategories = [category];
            }
        }
        if (category === "reset") {
            _.resetCategories();
            _.activeCategories = [];
        } else {
            _.updateMain();
            _.updateSide();
        }
    },
    updateAllToggles: function (value) {
        var _ = this;
        if (typeof value !== "boolean") throw "Value not boolean";
        _.selectMultiple = value;
        if (value) {
            _.multipleList.forEach(function (toggle) {
                helpers.addClass(toggle, _.multipleClass);
                toggle.setAttribute("aria-pressed", "" + value);
            });
        } else {
            _.multipleList.forEach(function (toggle) {
                helpers.removeClass(toggle, _.multipleClass);
                toggle.setAttribute("aria-pressed", "" + value);
            });
        }
    },
    resetCategories: function () {
        var _ = this,
            items = document.querySelectorAll(".item");

        items.forEach(function (item) {
            helpers.removeClass(item, "hidden");
        });
    },
    updateMain: function () {
        var _ = this,
            activeLinks, items;
        // console.log(_.linkMap);

        if (_.selectMultiple) {
            activeLinks = _.activeCategories.reduce(function (init, current) {
                return init.concat(_.linkMap[current]);
            }, []);
        } else {
            activeLinks = _.linkMap[_.activeCategories[0]];
        }

        items = document.querySelectorAll(".item");
        items.forEach(function (item) {
            helpers.addClass(item, "hidden");
        });

        activeLinks.forEach(function (link) {
            var item = helpers.ancestor(link, ".item");
            helpers.removeClass(item, "hidden");
        });
    },
    updateSide: function () {
        var _ = this,
            sideButtons = document.querySelectorAll(".categ__button--side");

        sideButtons.forEach(function (sideButton) {
            var category = sideButton.getAttribute("data-category");
            if (_.activeCategories.indexOf(category) === -1) {
                helpers.removeClass(sideButton, "button--inverted");
            } else {
                helpers.addClass(sideButton, "button--inverted")
            }
        });

    },
    buildHTML: function () {
        var _ = this;

        _.buildNav();
        _.buildItems();

    },
    _buildButton: function (buttonClass, text, categ) {
        if (buttonClass === 'string') {
            buttonClass = [buttonClass];
        }
        var button = document.createElement("button");
        button.textContent = text;
        button.setAttribute("class", buttonClass);
        if (categ) button.setAttribute("data-category", categ);
        return button;
    },
    buildNav: function () {
        var _ = this,
            fragment = document.createDocumentFragment(),
            categ = _.categ,
            buttonContainers;

        // build navigation
        categ.forEach(function (categ) {
            var button = _._buildButton('button categ__button categ__button--side', categ, categ);
            fragment.appendChild(button);
        });

        fragment.prepend(_._buildButton('button categ__button categ__button--side categ__button--reset', "Reset Categories", "reset"));

        buttonContainers = Array.prototype.slice.call(document.querySelectorAll(_.buttonContainer));
        buttonContainers.forEach(function (container) {
            container.appendChild(fragment.cloneNode(true));
        });
    },
    buildItems: function () {
        var _ = this,
            fragment = document.createDocumentFragment(),
            links = document.querySelectorAll(_.linkSelector);

        links.forEach(function (link) {
            var categories = link.getAttribute("data-category").trim().replace(/\s+/, " ").split(" "),
                button_container = document.createElement("div"),
                item = helpers.ancestor(link, '.item');
            button_container.setAttribute("class", "item__buttons");
            _.categ.forEach(function (category) {
                if (categories.indexOf(category) !== -1) {
                    button_container.appendChild(_._buildButton('button categ__button', category, category));
                }
            });

            if (item) item.appendChild(button_container);
        });
    },
    bindEvents: function () {
        var navOpen = document.querySelector(".page__top-button-side-open"),
            navClose = document.querySelector(".page__side-close"),
            pageSide = document.querySelector(".page__side"),
            page = document.querySelector(".page"),
            _ = this;
        navOpen.addEventListener("click", function (e) {
            e.preventDefault();
            if (helpers.hasClass(page, "page--side-open")) {
                helpers.removeClass(page, "page--side-open");
            } else {
                helpers.addClass(page, "page--side-open");
            }
        });
        navClose.addEventListener("click", function (e) {
            helpers.removeClass(page, "page--side-open");
        });
        pageSide.addEventListener("click", function (e) {
            if (!helpers.ancestor(e.target, ".page__side-inner")) {
                helpers.removeClass(page, "page--side-open");
            }
        });

        /// bind events on buttons

        page.addEventListener("click", function (e) {
            var eventTarget = e.target,
                btnSelector = ".categ__button",
                target;
            if (eventTarget.matches(btnSelector)) {
                target = eventTarget.getAttribute("data-category");
                _.updateCateg(target);
            }
        });

        /// bind events on multiple toggles

        page.addEventListener("click", function (e) {
            console.log("model", _);
            var eventTarget = e.target,
                toggleSelector = _.multipleSelector,
                ancestor, isPressed;

            ancestor = helpers.ancestor(eventTarget, toggleSelector);

            if (ancestor !== null) {
                isPressed = ancestor.getAttribute("aria-pressed") === "false" ? false : true;
                if (isPressed) {
                    ///  if selected -> not selected, remember only latest selected category
                    _.activeCategories = _.activeCategories.slice(-1);
                }
                _.updateAllToggles(!isPressed);
            }
        });
    },
    init: function () {
        var _ = this;

        var items = Array.prototype.slice.call(document.querySelectorAll(".items a[data-category]")),
            linkMap = {};
        items.forEach(function (item, index) {
            // presume only a single tag on each link
            var tag = item.getAttribute('data-category').toLowerCase();
            if (!tag) {
                item.setAttribute('data-category', 'uncategorized');
                tag = 'uncategorized';
            }
            // ensure all category tags are lowercase
            item.setAttribute('data-category', tag);
            if (!linkMap[tag]) {
                linkMap[tag] = [item];
            } else {
                linkMap[tag].push(item);
            }
        });

        _.linkMap = linkMap;
        _.categ = Object.keys(linkMap).sort();

        // console.log(_);

        _.buildHTML();

        _.multipleRegister();

        _.bindEvents();

    }
};


model.init();