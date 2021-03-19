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
            if (elem.parentElement === null) return false;
            if (elem.matches(ancestorSelector)) return elem;
            else return findAncestor(elem.parentElement);
        }
    }
};
var model = {
    currentTag: "",
    selectMultiple: false,
    categ: [],
    activeCateg: "",
    multipleCategs: [],
    linkMap: {},
    links: ".item__link",
    buttonContainer: ".categ",
    updateCateg: function (category) {

        var _ = this,
            index;
        if (_.selectMultiple) {
            if (_.multipleCategs.indexOf(category) === -1) {
                _.multipleCategs.push(category);
            } else {
                index = _.multipleCategs.indexOf(category);
                _.multipleCategs.splice(index, 1);
            }
        } else {
            if (_.activeCateg !== category) {
                _.activeCateg = category;
            }
        }
        if (category === "reset") {
            _.resetCategories();
        } else {
            _.updatePage();
        }


        // console.log("singe", _.activeCateg, "multiple", _.multipleCategs);
    },
    setMultiple: function (value) {
        if (typeof value === "boolean") this.selectMultiple = value;
        else throw "Value is not Boolean";
    },
    resetCategories: function () {
        var _ = this,
            items = document.querySelectorAll(".item");

        items.forEach(function (item) {
            helpers.removeClass(item, "hidden");
        });
    },
    updatePage: function () {
        var _ = this,
            elements_to_activate = [],
            activeLinks, activeButtons, items;
        // console.log(_.linkMap);

        if (_.selectMultiple) {
            activeLinks = _.multipleCategs.reduce(function (init, current) {
                return init.concat(_.linkMap[current]);
            }, []);
        } else {
            activeLinks = _.linkMap[_.activeCateg];
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
    buildNav: function () {
        var _ = this,
            fragment = document.createDocumentFragment(),
            categ = _.categ,
            buttonContainers;

        // build navigation
        categ.forEach(function (categ) {
            var button = _._buildButton('category-button categ__button categ__button--side', categ, categ);
            fragment.appendChild(button);
        });

        fragment.prepend(_._buildButton('category-button categ__button categ__button--side categ__button--reset', "Reset Categories", "reset"));

        buttonContainers = Array.prototype.slice.call(document.querySelectorAll(_.buttonContainer));
        buttonContainers.forEach(function (container) {
            container.appendChild(fragment.cloneNode(true));
        });
    },
    buildItems: function () {
        var _ = this,
            fragment = document.createDocumentFragment(),
            links = document.querySelectorAll(_.links);

        links.forEach(function (link) {
            var categories = link.getAttribute("data-category").trim().replace(/\s+/, " ").split(" "),
                button_container = document.createElement("div"),
                item = helpers.ancestor(link, '.item');
            button_container.setAttribute("class", "item__buttons");
            _.categ.forEach(function (category) {
                if (categories.indexOf(category) !== -1) {
                    button_container.appendChild(_._buildButton('category-button categ__button', category, category));
                }
            });

            if (item) item.appendChild(button_container);
        });
    },
    buildHTML: function () {
        var _ = this;

        _.buildNav();
        _.buildItems();

    },
    bindEvents: function () {
        var navOpen = document.querySelector(".page__open-side-button"),
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
                btnSelector = ".category-button",
                target;
            if (eventTarget.matches(btnSelector)) {
                target = eventTarget.getAttribute("data-category");
                _.updateCateg(target);
            }
        });

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

        console.log(_);

        _.buildHTML();

        _.bindEvents();
    }
};


model.init();