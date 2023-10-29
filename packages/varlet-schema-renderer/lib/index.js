var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/renderer.ts
import {
  defineComponent,
  h,
  renderList,
  ref,
  isRef,
  unref,
  toRefs,
  isProxy,
  isReactive,
  isReadonly,
  reactive,
  computed,
  readonly,
  watch,
  watchEffect,
  watchSyncEffect,
  watchPostEffect,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  Fragment,
  getCurrentInstance
} from "vue";
import { isArray as isArray2 } from "@varlet/shared";
import { createAxle } from "@varlet/axle";

// src/shared.ts
import { isPlainObject, isArray, isString } from "@varlet/shared";

// src/types.ts
var BuiltInSchemaNodeNames = /* @__PURE__ */ ((BuiltInSchemaNodeNames2) => {
  BuiltInSchemaNodeNames2["PAGE"] = "Page";
  BuiltInSchemaNodeNames2["TEXT"] = "Text";
  return BuiltInSchemaNodeNames2;
})(BuiltInSchemaNodeNames || {});
var BuiltInSchemaNodeBindingTypes = /* @__PURE__ */ ((BuiltInSchemaNodeBindingTypes2) => {
  BuiltInSchemaNodeBindingTypes2["EXPRESSION_BINDING"] = "Expression";
  BuiltInSchemaNodeBindingTypes2["RENDER_BINDING"] = "Render";
  BuiltInSchemaNodeBindingTypes2["V_NODE_BINDING"] = "VNode";
  return BuiltInSchemaNodeBindingTypes2;
})(BuiltInSchemaNodeBindingTypes || {});

// src/shared.ts
function isSchemaPageNode(schemaNode) {
  return schemaNode.name === "Page" /* PAGE */;
}
function isSchemaTextNode(schemaNode) {
  return schemaNode.name === "Text" /* TEXT */;
}
function isExpressionBinding(value) {
  return isPlainObject(value) && value.type === "Expression" /* EXPRESSION_BINDING */;
}
function isObjectBinding(value) {
  return isPlainObject(value) && !isExpressionBinding(value) && !isRenderBinding(value) && !isVNodeBinding(value);
}
function isRenderBinding(value) {
  return isPlainObject(value) && value.type === "Render" /* RENDER_BINDING */ && value.id;
}
function isVNodeBinding(value) {
  return isPlainObject(value) && value.type === "VNode" /* V_NODE_BINDING */;
}
function cloneSchemaNode(schemaNode) {
  return JSON.parse(JSON.stringify(schemaNode));
}
function normalizeClasses(value) {
  return isArray(value) ? value : isString(value) ? value.split(" ") : [];
}

// src/renderer.ts
var STYLE_ID_PREFIX = "schema-renderer-style";
var SCOPE_VARIABLES = ["$item", "$index", "$slotProps", "$renderArgs"];
var axle = createAxle({});
var Renderer = defineComponent({
  props: {
    schema: {
      type: Object,
      required: true,
      default: () => ({})
    },
    components: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    var _a, _b;
    const ctx = {
      h,
      ref,
      reactive,
      computed,
      readonly,
      watch,
      watchEffect,
      watchSyncEffect,
      watchPostEffect,
      isRef,
      unref,
      toRefs,
      isProxy,
      isReactive,
      isReadonly,
      onBeforeMount,
      onMounted,
      onBeforeUpdate,
      onUpdated,
      onBeforeUnmount,
      onUnmounted,
      exec,
      axle
    };
    const { uid } = getCurrentInstance();
    const code = (_b = (_a = props.schema.compatibleCode) != null ? _a : props.schema.code) != null ? _b : "function setup() { return {} }";
    const setup = exec(code);
    const setupCtx = setup();
    Object.assign(ctx, setupCtx);
    onMounted(mountCss);
    onUnmounted(unmountCss);
    watch(() => props.schema.css, updateCss);
    function exec(expression, context) {
      return window.evalWith(expression, context != null ? context : ctx);
    }
    function mountCss() {
      if (!props.schema.css) {
        return;
      }
      const style = document.createElement("style");
      style.innerHTML = props.schema.css;
      style.id = `${STYLE_ID_PREFIX}-${uid}`;
      document.head.appendChild(style);
    }
    function unmountCss() {
      const style = document.querySelector(`#${STYLE_ID_PREFIX}-${uid}`);
      if (style) {
        document.head.removeChild(style);
      }
    }
    function updateCss() {
      unmountCss();
      mountCss();
    }
    function createNewScopeVariables(oldScopeVariables, partialScopeVariables) {
      return __spreadValues(__spreadValues({}, oldScopeVariables), partialScopeVariables);
    }
    function includesScopeVariable(expression) {
      return SCOPE_VARIABLES.some((scopedVariable) => expression.includes(scopedVariable));
    }
    function resolveScopedExpression(expression, scopeVariables) {
      return exec(expression, __spreadValues(__spreadValues({}, ctx), scopeVariables));
    }
    function getExpressionBindingValue(expression, scopeVariables) {
      if (!includesScopeVariable(expression)) {
        return exec(expression);
      }
      return resolveScopedExpression(expression, scopeVariables);
    }
    function getObjectBindingValue(value, scopeVariables) {
      return Object.keys(value).reduce((newValue, key) => {
        newValue[key] = getBindingValue(value[key], scopeVariables);
        return newValue;
      }, {});
    }
    function getBindingValue(value, scopeVariables) {
      var _a2, _b2;
      if (isRenderBinding(value)) {
        return (...args) => {
          const newScopeVariables = createNewScopeVariables(scopeVariables, {
            $renderArgs: __spreadProps(__spreadValues({}, scopeVariables.$renderArgs), {
              [value.id]: args
            })
          });
          const conditionedSchemaNodes = withCondition(value.value, newScopeVariables);
          return h(
            Fragment,
            conditionedSchemaNodes.map((schemaNode) => renderSchemaNode(schemaNode, newScopeVariables))
          );
        };
      }
      if (isVNodeBinding(value)) {
        const condition = (_a2 = getBindingValue(value.value.if, scopeVariables)) != null ? _a2 : true;
        return condition ? renderSchemaNode(value.value, scopeVariables) : void 0;
      }
      if (isExpressionBinding(value)) {
        return getExpressionBindingValue((_b2 = value.compatibleValue) != null ? _b2 : value.value, scopeVariables);
      }
      if (isObjectBinding(value)) {
        return getObjectBindingValue(value, scopeVariables);
      }
      if (isArray2(value)) {
        return value.map((value2) => getBindingValue(value2, scopeVariables));
      }
      return value;
    }
    function renderVNode(schemaNode, scopeVariables) {
      const propsBinding = getPropsBinding(schemaNode, scopeVariables);
      const classes = normalizeClasses(propsBinding.class);
      const props2 = __spreadProps(__spreadValues({}, propsBinding), { class: classes });
      if (isSchemaTextNode(schemaNode)) {
        const { value } = schemaNode;
        return h("span", props2, getBindingValue(value, scopeVariables));
      }
      return h(getComponent(schemaNode.name), props2, renderSchemaNodeSlots(schemaNode, scopeVariables));
    }
    function getComponent(schemaNodeName) {
      return props.components[schemaNodeName];
    }
    function parsePropsVModel(schemaNodeProps = {}) {
      const newSchemaNodeProps = Object.entries(schemaNodeProps).reduce((newSchemaNodeProps2, [key, value]) => {
        if (!key.startsWith("v-model")) {
          newSchemaNodeProps2[key] = value;
          return newSchemaNodeProps2;
        }
        const stateKey = key.startsWith("v-model:") ? key.replace("v-model:", "") : "modelValue";
        const updateKey = `onUpdate:${stateKey}`;
        newSchemaNodeProps2[stateKey] = value;
        newSchemaNodeProps2[updateKey] = {
          type: "Expression" /* EXPRESSION_BINDING */,
          value: `(value) => { ${value.value} = value }`
        };
        return newSchemaNodeProps2;
      }, {});
      return newSchemaNodeProps;
    }
    function getPropsBinding(schemaNode, scopeVariables) {
      var _a2;
      const rawProps = Object.entries(parsePropsVModel((_a2 = schemaNode.props) != null ? _a2 : {})).reduce((rawProps2, [key, value]) => {
        rawProps2[key] = getBindingValue(value, scopeVariables);
        return rawProps2;
      }, {});
      return rawProps;
    }
    function withCondition(schemaNodes, scopeVariables) {
      return schemaNodes.filter((schemaNode) => {
        var _a2;
        return !!getBindingValue((_a2 = schemaNode.if) != null ? _a2 : true, scopeVariables);
      });
    }
    function renderSchemaNode(schemaNode, scopeVariables) {
      if (!schemaNode.hasOwnProperty("for")) {
        return renderVNode(schemaNode, scopeVariables);
      }
      const bindingValue = getBindingValue(schemaNode.for, scopeVariables);
      return h(
        Fragment,
        null,
        renderList(bindingValue, (item, index) => {
          const clonedSchemaNode = cloneSchemaNode(schemaNode);
          return renderVNode(
            clonedSchemaNode,
            createNewScopeVariables(scopeVariables, {
              $item: __spreadProps(__spreadValues({}, scopeVariables.$item), {
                [schemaNode.id]: item
              }),
              $index: __spreadProps(__spreadValues({}, scopeVariables.$index), {
                [schemaNode.id]: index
              })
            })
          );
        })
      );
    }
    function renderSchemaNodeSlots(schemaNode, scopeVariables) {
      var _a2;
      try {
        const slots = __spreadValues({}, (_a2 = schemaNode.slots) != null ? _a2 : {});
        if (!slots.default && schemaNode.children) {
          slots.default = {
            children: [...schemaNode.children]
          };
        }
        return Object.entries(slots).reduce((rawSlots, [slotName, slot]) => {
          rawSlots[slotName] = (slotProps) => {
            var _a3;
            const newScopeVariables = createNewScopeVariables(scopeVariables, {
              $slotProps: __spreadProps(__spreadValues({}, scopeVariables.$slotProps), {
                [schemaNode.id]: slotProps
              })
            });
            return withCondition((_a3 = slot.children) != null ? _a3 : [], newScopeVariables).map(
              (schemaNode2) => renderSchemaNode(schemaNode2, newScopeVariables)
            );
          };
          return rawSlots;
        }, {});
      } catch (e) {
        console.error("Renderer error, please check console");
        throw e;
      }
    }
    return () => h("div", { class: "schema-renderer" }, renderSchemaNodeSlots(props.schema, {}));
  }
});
export {
  BuiltInSchemaNodeBindingTypes,
  BuiltInSchemaNodeNames,
  Renderer,
  cloneSchemaNode,
  isExpressionBinding,
  isObjectBinding,
  isRenderBinding,
  isSchemaPageNode,
  isSchemaTextNode,
  isVNodeBinding,
  normalizeClasses
};
