/*jshint browser:true,camelcase:true,curly:true,eqeqeq:true,forin:true,immed:true,jquery:true,latedef:true,maxparams:5,maxdepth:5,noarg:true,noempty:true,nonew:true,undef:true,unused:vars,strict:true */
/**
 * SapientNitro jQuery module controller
 *
 * @dependencies:
 * - jquery
 *
 * @project Generic
 * @date 2013
 * @author Niklas Zillinger, Sapient GmbH
 * @site miscellaneous
 *
 * This controller is intended to coordinate the creation, registration
 * and initialization of modules on a page.
 *
 * It automatically registers a JS object (with jQuery module structure)
 * in the jQuery namespace. In this way it's also attached to the
 * data-object of a DOM node upon execution. The JS object
 * must contain a "construct" method in order to make it a module.
 *
 * The registered module is automatically initialized for all elements
 * that match the passed css selector.
 * In this way it's sufficient to simply add a module to a page, in order
 * to make it usable right away.
 *
 * In case the default css selector or options are insufficient, they can
 * be overwritten with a configuration object for registration.
 *
 * moduleMapping = {
 *   "moduleName1" : {
 *         selector : "moduleName",
 *         options  : optionsJSONObject
 *   },
 *   "moduleName2" : {[...]}
 * }
 *
 *
 */

/* grab the sapient nitro (sn) namespace or create one */
if (typeof window.sn === "undefined") {
    window.sn = {};
}

(function (window, document, $, sn) {

    'use strict';

    sn.moduleController = (function () {
        /**
         * List container for all registered modules
         */
        var modules = [], plugins = [], initializedPlugins = [],
        // contains all modules waiting for their dependencies to be initialized for a single initAllModule() call.
        // key is the name of the module teh module waits for, value the module registration module.
            modulesWaitingForDependencies = {};
        /**
         * TBD - eventually move to a global sn.config object
         *
         * In case we know the module's css selector and option
         * defaults are insufficient, we can override them here
         * for registration and initialization.
         *
         * moduleMapping = {
         *   "moduleName1" : {
         *         selector : "moduleName",
         *         options  : optionsJSONObject
         *   },
         *   "moduleName2" : {[...]}
         * }
         */
        var moduleMapping = {};


        /**
         * getter method for all registered modules
         */
        var getRegisteredModules = function () {
            return modules;
        };

        /**
         * getter method for all registered modules name
         */
        var getRegisteredModulesNames = function () {
            var modulesName = [];
            $.each(modules, function (index, element) {
                var hasName = element.hasOwnProperty('name');
                if (hasName) {
                    modulesName.push(element.name);
                }
            });
            return modulesName;
        };

        /**
         * getter method for all registered plugins
         */
        var getRegisteredPlugins = function () {
            return plugins;
        };

        /**
         * getter method for all registered plugins name
         */
        var getRegisteredPluginsNames = function () {
            var pluginsName = [];
            $.each(plugins, function (index, element) {
                var hasName = element.hasOwnProperty('name');
                if (hasName) {
                    pluginsName.push(element.name);
                }
            });
            return pluginsName;
        };

        /**
         * Register a module in the jQuery namespace as a plugin
         * After that it can be called on any jQuery selection:
         * $(".someSelector").myPluginName();
         * Every module is only bound once to a DOM node.
         * When bounded the module can also be accessed externally through the
         * jQuery data method. For example:
         *
         *   var exp = $("#myExpandable").data("expandable");
         *   exp.open();
         *
         * Here "expandable" is the module (and plugin) name and open() is a publicly available
         * function that can be called from everywhere in this way.
         *
         * @param [name] - moduleName to register with and to call as jQuery plugin
         * @param [object] - the module Object reference
         */
        var createjQueryPlugin = function (object, name) {
            $.fn[name] = function (options) {
                return this.each(function () {
                    if (!$.data(this, name)) {
                        $.data(this, name, Object.create(object).construct($(this), options));
                    }
                });
            };
        };


        /**
         * Process the array of functions for any given simple module
         *
         * @param [module] - simple module object that is passed for initialization
         * @param [fArray] - array of functions to be called upon global initialization
         * @param [context] optional DOM context for the module group to be (re-)initialized
         */
        var processFunctionList = function (module, fArray, context) {
            var i, c = fArray.length;
            for (i = 0; i < c; (i += 1)) {
                module[fArray[i]](context);
            }
        };


        /**
         * Apply jQuery plugin to the given css selektor match
         *
         * @param [module] - pluginable module object that is passed for initialization
         * @param [context] optional DOM context for the module group to be (re-)initialized
         */
        var applyPlugin = function (module, context) {
            var parent = (typeof context === "undefined") ? $(document) : $(context);
            if (typeof parent.find(module.selector)[module.name] === "function") {
                parent.find(module.selector)[module.name](module.options);
            }
        };

        var pluginInitialized = function pluginInitialized(module) {
            var i = 0;
            initializedPlugins.push(module.name);
            if (module.name in modulesWaitingForDependencies) {
                for (i = 0; i < modulesWaitingForDependencies[module.name].length; i += 1) {
                    if (!isModuleInitialized(modulesWaitingForDependencies[module.name][i].name)) {
                        initializePluginWhenAllDependenciesAreInitialized(modulesWaitingForDependencies[module.name][i]);
                    }
                }
                delete modulesWaitingForDependencies[module.name];
            }
        };

        var clearInitializedPluginsList = function clearInitializedPluginsList() {
            initializedPlugins = [];
        };

        var isModuleInitialized = function (moduleName) {
            return initializedPlugins.indexOf(moduleName) !== -1;
        };

        var initializePluginWhenAllDependenciesAreInitialized = function initializePluginWhenAllDependenciesAreInitialized(module, context) {
            var i = 0,
                dependenciesLength = module.dependencies.length,
                missingModules = 0;
            for (; i < dependenciesLength; i += 1) {
                if (!isModuleInitialized(module.dependencies[i])) {
                    missingModules += 1;
                    modulesWaitingForDependencies[module.dependencies[i]] = modulesWaitingForDependencies[module.dependencies[i]] || [];
                    modulesWaitingForDependencies[module.dependencies[i]].push(module);
                }
            }
            if (missingModules === 0) {
                initializeModule(module, context);
            }
        };

        var initializeModule = function initializeModule(module, context) {
            if (module.type === "plugin") {
                applyPlugin(module, context);
            } else if (module.type === "initializer") {
                processFunctionList(module.module, module.functionList, context);
            }
        };

        function joinModuleNames(modules) {
            var i = 0,
                moduleNames = [],
                length = modules.length;
            for (; i < length; i += 1) {
                if (moduleNames.indexOf(modules[i].name) === -1) {
                    moduleNames.push(modules[i].name);
                }
            }
            return moduleNames.join(", ");
        }

        /**
         * Initialize all known modules.
         * @param [context] optional DOM context for the module group to be (re-)initialized
         */
        var initAllModules = function (context) {
            modules = modules.sort();
            //clean the initialized plugins list because only the current context is of interest.
            clearInitializedPluginsList();
            var m, moduleCount = modules.length;

            /* loop through all modules and initialize it (call jQuery plugins) */
            for (m = 0; m < moduleCount; (m += 1)) {
                if (modules[m].dependencies && modules[m].dependencies.length > 0) {
                    initializePluginWhenAllDependenciesAreInitialized(modules[m], context);
                } else {
                    initializeModule(modules[m], context);
                    pluginInitialized(modules[m]);
                }
            }
            for (var key in modulesWaitingForDependencies) {
                if (modulesWaitingForDependencies.hasOwnProperty(key)) {
                    window.console.error("Some modules are still waiting for '" + key + "' to be initialized: " + joinModuleNames(modulesWaitingForDependencies[key]) + ".");
                }
            }
        };


        /**
         * Initialize all known plugins.
         * Optionally a DOM node/branch can be passed to scope the context for the
         * (re-)initialization of a certain module group.
         * For example a specific DOM node/branch that is replaced with an AJAX response.
         *
         * @param [context] optional DOM context for the module group to be (re-)initialized
         */
        var initPlugins = function (context) {
            var p, pluginCount = plugins.length;

            /* loop through all modules and initialize it (call jQuery plugins) */
            for (p = 0; p < pluginCount; (p += 1)) {
                applyPlugin(plugins[p], context);
            }
        };


        /**
         * Register a module with the controller.
         *
         * If the third parameter in the passed arguments is an array - it's considered
         * as a simple module registration, so all functions will be called once upon initialization.
         *
         * If the third parameter is an cssSelector the passed module is considered as a jQuery plugin
         * and published to the jQuery namespace with its modulename: $(".someSelector").myModuleName();
         * Every registered module is automatically initialized for the given css
         * selector match, but there is an overruling configuration in the moduleMaping possible.
         *
         * @param name - module name that is used for registration (and jQuery plugin call for plugin modules)
         * @param module - module object that is passed for initialization
         * @param registerType - either a css selector (for plugins) or an array of functions (simple modules)
         * @param [opt] - optional options object only for plugin initialization calls
         * @param [dependencies] - optional array containing the name of modules that must be initialized before
         *                          the registered one is initialized.
         */
        var register = function (name, module, registerType, opt, dependencies) {
            var simple = $.isArray(registerType),
                options = opt || {},
                selector, functionList, registerObject;

            /* make sure we have everything we need for registration */
            if (typeof name === "undefined" || typeof name !== "string") {
                throw "No module name defined";
            }
            if (typeof module !== "object") {
                throw "No object defined for module registration";
            }
            if (typeof registerType === "undefined") {
                throw "No default css selector or array of functions defined";
            }

            /* simple modules (not plugin-able) are processed differently */
            if (!simple) {
                /* when not a simple module, the registerType is defined as a css selector */
                selector = registerType;
                /* if we have some overruling configuration, replace defaults */
                if (typeof moduleMapping[name] !== "undefined") {
                    selector = moduleMapping[name].selector;
                    options = moduleMapping[name].options;
                }

                /* make it available as a jQuery plugin */
                createjQueryPlugin(module, name);

                registerObject = {
                    name: name,
                    selector: selector,
                    options: options,
                    type: "plugin",
                    dependencies: dependencies || []
                };

                /* modules contains the initialization stack ... */
                modules.push(registerObject);
                /* ... and plugins keep a separate stack for reinitialization (e. g. after AJAX replacement) */
                plugins.push(registerObject);
            } else {
                /* when a simple module, the registerType is defined as an array of functions */
                functionList = registerType;

                registerObject = {
                    name: name,
                    module: module,
                    functionList: functionList,
                    type: "initializer"
                };

                modules.push(registerObject);
            }


        };


        /**
         * Return public properties/methods
         * @see www.wait-till-i.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
         */
        return {
            register: register,
            initAllModules: initAllModules,
            initPlugins: initPlugins,
            getRegisteredModules: getRegisteredModules,
            getRegisteredModulesNames: getRegisteredModulesNames,
            getRegisteredPlugins: getRegisteredPlugins,
            getRegisteredPluginsNames: getRegisteredPluginsNames
        };
    }());
}(window, document, jQuery, sn));
/* initialize all modules on document.ready */
jQuery(function () {
    'use strict';
    sn.moduleController.initAllModules();
});