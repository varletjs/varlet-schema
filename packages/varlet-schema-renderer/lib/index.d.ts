import * as vue from 'vue';
import { PropType, Component, VNode } from 'vue';

declare enum BuiltInSchemaNodeNames {
    PAGE = "Page",
    TEXT = "Text"
}
declare enum BuiltInSchemaNodeBindingTypes {
    EXPRESSION_BINDING = "Expression",
    RENDER_BINDING = "Render",
    V_NODE_BINDING = "VNode"
}
type SchemaNodeProps = Record<string, SchemaNodeBinding>;
type SchemaNodeSlots = Record<string, SchemaNodeSlot>;
type SchemaNodeBinding = any;
interface SchemaNodeSlot {
    children: (SchemaNode | SchemaTextNode)[];
}
interface SchemaNode {
    name: string;
    id?: string;
    props?: SchemaNodeProps;
    slots?: SchemaNodeSlots;
    children?: (SchemaNode | SchemaTextNode)[];
    if?: SchemaNodeBinding;
    for?: SchemaNodeBinding;
}
interface SchemaTextNode extends SchemaNode {
    name: BuiltInSchemaNodeNames.TEXT | 'Text';
    value: SchemaNodeBinding;
}
interface SchemaPageNode extends SchemaNode {
    name: BuiltInSchemaNodeNames.PAGE | 'Page';
    code?: string;
    compatibleCode?: string;
    css?: string;
}
interface ScopeVariables {
    $item?: Record<string, any>;
    $index?: Record<string, any>;
    $slotProps?: Record<string, any>;
    $renderArgs?: Record<string, any[]>;
}
type RawSlots = {
    [name: string]: unknown;
};
type RawProps = Record<string, any>;
type SchemaNodeVisitor = (value: any, key: string | number, target: any) => void;

declare const Renderer: vue.DefineComponent<{
    schema: {
        type: PropType<SchemaPageNode>;
        required: true;
        default: () => {};
    };
    components: {
        type: PropType<Record<string, Component>>;
        default: () => {};
    };
}, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps, Readonly<vue.ExtractPropTypes<{
    schema: {
        type: PropType<SchemaPageNode>;
        required: true;
        default: () => {};
    };
    components: {
        type: PropType<Record<string, Component>>;
        default: () => {};
    };
}>>, {
    schema: SchemaPageNode;
    components: Record<string, Component>;
}, {}>;

declare function isSchemaPageNode(schemaNode: unknown): schemaNode is SchemaPageNode;
declare function isSchemaTextNode(schemaNode: unknown): schemaNode is SchemaTextNode;
declare function isExpressionBinding(value: unknown): boolean;
declare function isObjectBinding(value: unknown): boolean;
declare function isRenderBinding(value: unknown): boolean;
declare function isVNodeBinding(value: unknown): boolean;
declare function cloneSchemaNode<T extends SchemaNode | JSX.Element>(schemaNode: T): T;
declare function normalizeClasses(value: unknown): string[];

export { BuiltInSchemaNodeBindingTypes, BuiltInSchemaNodeNames, RawProps, RawSlots, Renderer, SchemaNode, SchemaNodeBinding, SchemaNodeProps, SchemaNodeSlot, SchemaNodeSlots, SchemaNodeVisitor, SchemaPageNode, SchemaTextNode, ScopeVariables, cloneSchemaNode, isExpressionBinding, isObjectBinding, isRenderBinding, isSchemaPageNode, isSchemaTextNode, isVNodeBinding, normalizeClasses };
