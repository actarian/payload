/* eslint-disable no-use-before-define */
import { CSSProperties } from 'react';
import { Editor } from 'slate';
import type { TFunction, i18n as Ii18n } from 'i18next';
import type { EditorProps } from '@monaco-editor/react';
import { Operation, Where } from '../../types';
import { SanitizedConfig } from '../../config/types';
import { TypeWithID } from '../../collections/config/types';
import { PayloadRequest, RequestContext } from '../../express/types';
import { ConditionalDateProps } from '../../admin/components/elements/DatePicker/types';
import { Description } from '../../admin/components/forms/FieldDescription/types';
import { User } from '../../auth';
import { Payload } from '../../payload';
import { RowLabel } from '../../admin/components/forms/RowLabel/types';

export type FieldHookArgs<T extends TypeWithID = any, P = any, S = any> = {
  /** The data passed to update the document within create and update operations, and the full document itself in the afterRead hook. */
  data?: Partial<T>,
  /** Boolean to denote if this hook is running against finding one, or finding many within the afterRead hook. */
  findMany?: boolean
  /** The full original document in `update` operations. In the `afterChange` hook, this is the resulting document of the operation. */
  originalDoc?: T,
  /** The document before changes were applied, only in `afterChange` hooks. */
  previousDoc?: T,
  /** The sibling data from the previous document in `afterChange` hook. */
  previousSiblingDoc?: T,
  /** A string relating to which operation the field type is currently executing within. Useful within beforeValidate, beforeChange, and afterChange hooks to differentiate between create and update operations. */
  operation?: 'create' | 'read' | 'update' | 'delete',
  /** The Express request object. It is mocked for Local API operations. */
  req: PayloadRequest
  /** The sibling data passed to a field that the hook is running against. */
  siblingData: Partial<S>
  /** The value of the field. */
  value?: P,
  previousValue?: P,
  context: RequestContext
}

export type FieldHook<T extends TypeWithID = any, P = any, S = any> = (args: FieldHookArgs<T, P, S>) => Promise<P> | P;

export type FieldAccess<T extends TypeWithID = any, P = any, U = any> = (args: {
  req: PayloadRequest<U>
  id?: string | number
  data?: Partial<T>
  siblingData?: Partial<P>
  doc?: T
}) => Promise<boolean> | boolean;

export type Condition<T extends TypeWithID = any, P = any> = (data: Partial<T>, siblingData: Partial<P>, { user }: { user: User }) => boolean;

export type FilterOptionsProps<T = any> = {
  id: string | number,
  user: Partial<User>,
  data: T,
  siblingData: unknown,
  relationTo: string,
}

export type FilterOptions<T = any> = Where | ((options: FilterOptionsProps<T>) => Where);

type Admin = {
  position?: 'sidebar';
  width?: string;
  style?: CSSProperties;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
  condition?: Condition;
  description?: Description;
  components?: {
    Filter?: React.ComponentType<any>;
    Cell?: React.ComponentType<any>;
    Field?: React.ComponentType<any>;
  }
  disableBulkEdit?: boolean
  hidden?: boolean
}

export type Labels = {
  singular: Record<string, string> | string;
  plural: Record<string, string> | string;
};

export type ValidateOptions<TData, TSiblingData, TFieldConfig> = {
  data: Partial<TData>
  siblingData: Partial<TSiblingData>
  id?: string | number
  user?: Partial<User>
  operation?: Operation
  payload?: Payload
  t: TFunction
} & TFieldConfig;

export type Validate<TValue = any, TData = any, TSiblingData = any, TFieldConfig = any> = (value: TValue, options: ValidateOptions<TData, TSiblingData, TFieldConfig>) => string | true | Promise<string | true>;

export type OptionObject = {
  label: Record<string, string> | string
  value: string
}

export type Option = OptionObject | string

export interface FieldBase {
  name: string;
  label?: Record<string, string> | string | false;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  defaultValue?: any;
  hidden?: boolean;
  saveToJWT?: boolean
  localized?: boolean;
  validate?: Validate;
  hooks?: {
    beforeValidate?: FieldHook[];
    beforeChange?: FieldHook[];
    afterChange?: FieldHook[];
    afterRead?: FieldHook[];
  }
  admin?: Admin;
  access?: {
    create?: FieldAccess;
    read?: FieldAccess;
    update?: FieldAccess;
  };
  /** Extension point to add your custom data. */
  custom?: Record<string, any>;
}

export type NumberField = FieldBase & {
  type: 'number';
  admin?: Admin & {
    /** Set this property to a string that will be used for browser autocomplete. */
    autoComplete?: string
    /** Set this property to define a placeholder string for the field. */
    placeholder?: Record<string, string> | string
    /** Set a value for the number field to increment / decrement using browser controls. */
    step?: number
  }
  /** Minimum value accepted. Used in the default `validation` function. */
  min?: number
  /** Maximum value accepted. Used in the default `validation` function. */
  max?: number
} & ({
  /** Makes this field an ordered array of numbers instead of just a single number. */
  hasMany: true
  /** Minimum number of numbers in the numbers array, if `hasMany` is set to true. */
  minRows?: number
  /** Maximum number of numbers in the numbers array, if `hasMany` is set to true. */
  maxRows?: number
} | {
  /** Makes this field an ordered array of numbers instead of just a single number. */
  hasMany?: false | undefined
  /** Minimum number of numbers in the numbers array, if `hasMany` is set to true. */
  minRows?: undefined
  /** Maximum number of numbers in the numbers array, if `hasMany` is set to true. */
  maxRows?: undefined
})


export type TextField = FieldBase & {
  type: 'text';
  maxLength?: number
  minLength?: number
  admin?: Admin & {
    placeholder?: Record<string, string> | string
    autoComplete?: string
  }
}

export type EmailField = FieldBase & {
  type: 'email';
  admin?: Admin & {
    placeholder?: Record<string, string> | string
    autoComplete?: string
  }
}

export type TextareaField = FieldBase & {
  type: 'textarea';
  maxLength?: number
  minLength?: number
  admin?: Admin & {
    placeholder?: Record<string, string> | string
    rows?: number
  }
}

export type CheckboxField = FieldBase & {
  type: 'checkbox';
}

export type DateField = FieldBase & {
  type: 'date';
  admin?: Admin & {
    placeholder?: Record<string, string> | string
    date?: ConditionalDateProps
  }
}

export type GroupField = Omit<FieldBase, 'required' | 'validation'> & {
  type: 'group';
  fields: Field[];
  admin?: Admin & {
    hideGutter?: boolean
  }
  /** Customize generated GraphQL and Typescript schema names.
   * By default it is bound to the collection.
   *
   * This is useful if you would like to generate a top level type to share amongst collections/fields.
   * **Note**: Top level types can collide, ensure they are unique among collections, arrays, groups, blocks, tabs.
   */
  interfaceName?: string
}

export type RowAdmin = Omit<Admin, 'description'>;

export type RowField = Omit<FieldBase, 'admin' | 'name' | 'label'> & {
  admin?: RowAdmin;
  type: 'row';
  fields: Field[];
}

export type CollapsibleField = Omit<FieldBase, 'name' | 'label'> & {
  type: 'collapsible';
  label: RowLabel
  fields: Field[];
  admin?: Admin & {
    initCollapsed?: boolean | false;
  }
}

export type TabsAdmin = Omit<Admin, 'description'>;

type TabBase = Omit<FieldBase, 'required' | 'validation'> & {
  fields: Field[]
  description?: Description
  interfaceName?: string
}

export type NamedTab = TabBase & {
  /** Customize generated GraphQL and Typescript schema names.
   * The slug is used by default.
   *
   * This is useful if you would like to generate a top level type to share amongst collections/fields.
   * **Note**: Top level types can collide, ensure they are unique among collections, arrays, groups, blocks, tabs.
   */
  interfaceName?: string
}

export type UnnamedTab = Omit<TabBase, 'name'> & {
  label: Record<string, string> | string
  localized?: never
  interfaceName?: never
}

export type Tab = NamedTab | UnnamedTab

export type TabsField = Omit<FieldBase, 'admin' | 'name' | 'localized'> & {
  type: 'tabs';
  tabs: Tab[]
  admin?: TabsAdmin
}

export type TabAsField = Tab & {
  type: 'tab'
  name?: string
};

export type UIField = {
  name: string
  label?: Record<string, string> | string
  admin: {
    position?: string
    width?: string
    condition?: Condition
    disableBulkEdit?: boolean
    components?: {
      Filter?: React.ComponentType<any>;
      Cell?: React.ComponentType<any>;
      Field: React.ComponentType<any>;
    }
  }
  type: 'ui';
  /** Extension point to add your custom data. */
  custom?: Record<string, any>;
}

export type UploadField = FieldBase & {
  type: 'upload'
  relationTo: string
  maxDepth?: number
  filterOptions?: FilterOptions;
}

type CodeAdmin = Admin & {
  language?: string;
  editorOptions?: EditorProps['options'];
}

export type CodeField = Omit<FieldBase, 'admin'> & {
  admin?: CodeAdmin
  minLength?: number
  maxLength?: number
  type: 'code';
}

type JSONAdmin = Admin & {
  editorOptions?: EditorProps['options'];
}

export type JSONField = Omit<FieldBase, 'admin'> & {
  admin?: JSONAdmin
  type: 'json';
}

export type SelectField = FieldBase & {
  type: 'select'
  options: Option[]
  hasMany?: boolean
  admin?: Admin & {
    isClearable?: boolean;
    isSortable?: boolean;
  }
}

export type RelationshipField = FieldBase & {
  type: 'relationship';
  relationTo: string | string[];
  hasMany?: boolean;
  maxDepth?: number;
  filterOptions?: FilterOptions;
  admin?: Admin & {
    isSortable?: boolean;
    allowCreate?: boolean;
  },
} & ({
  hasMany: true
  /**
   * @deprecated Use 'minRows' instead
   */
  min?: number
  /**
   * @deprecated Use 'maxRows' instead
   */
  max?: number
  minRows?: number
  maxRows?: number
} | {
  hasMany?: false | undefined
  /**
   * @deprecated Use 'minRows' instead
   */
  min?: undefined
  /**
   * @deprecated Use 'maxRows' instead
   */
  max?: undefined
  minRows?: undefined
  maxRows?: undefined
})

export type ValueWithRelation = {
  relationTo: string
  value: string | number
}

export function valueIsValueWithRelation(value: unknown): value is ValueWithRelation {
  return value !== null && typeof value === 'object' && 'relationTo' in value && 'value' in value;
}

export type RelationshipValue = (string | number)
  | (string | number)[]
  | ValueWithRelation
  | ValueWithRelation[]

type RichTextPlugin = (editor: Editor) => Editor;

export type RichTextCustomElement = {
  name: string
  Button: React.ComponentType<any>
  Element: React.ComponentType<any>
  plugins?: RichTextPlugin[]
}

export type RichTextCustomLeaf = {
  name: string
  Button: React.ComponentType<any>
  Leaf: React.ComponentType<any>
  plugins?: RichTextPlugin[]
}

export type RichTextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'ul' | 'ol' | 'link' | 'relationship' | 'upload' | 'indent' | RichTextCustomElement;
export type RichTextLeaf = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | RichTextCustomLeaf;

export type RichTextField = FieldBase & {
  type: 'richText';
  admin?: Admin & {
    placeholder?: Record<string, string> | string
    elements?: RichTextElement[];
    leaves?: RichTextLeaf[];
    hideGutter?: boolean
    upload?: {
      collections: {
        [collection: string]: {
          fields: Field[];
        }
      }
    }
    link?: {
      fields?: Field[] | ((args: { defaultFields: Field[], config: SanitizedConfig, i18n: Ii18n }) => Field[]);
    }
  }
}

export type ArrayField = FieldBase & {
  type: 'array';
  minRows?: number;
  maxRows?: number;
  labels?: Labels;
  fields: Field[];
  admin?: Admin & {
    initCollapsed?: boolean | false;
    components?: {
      RowLabel?: RowLabel
    } & Admin['components']
  };
  /** Customize generated GraphQL and Typescript schema names.
   * By default it is bound to the collection.
   *
   * This is useful if you would like to generate a top level type to share amongst collections/fields.
   * **Note**: Top level types can collide, ensure they are unique among collections, arrays, groups, blocks, tabs.
   */
  interfaceName?: string
};

export type RadioField = FieldBase & {
  type: 'radio';
  options: Option[]
  admin?: Admin & {
    layout?: 'horizontal' | 'vertical'
  }
}

export type Block = {
  slug: string;
  labels?: Labels;
  fields: Field[];
  imageURL?: string;
  imageAltText?: string;
  /** @deprecated - please migrate to the interfaceName property instead. */
  graphQL?: {
    singularName?: string
  }
  /** Customize generated GraphQL and Typescript schema names.
   * The slug is used by default.
   *
   * This is useful if you would like to generate a top level type to share amongst collections/fields.
   * **Note**: Top level types can collide, ensure they are unique among collections, arrays, groups, blocks, tabs.
   */
  interfaceName?: string
}

export type BlockField = FieldBase & {
  type: 'blocks';
  minRows?: number;
  maxRows?: number;
  blocks: Block[];
  defaultValue?: unknown
  labels?: Labels
  admin?: Admin & {
    initCollapsed?: boolean | false;
  }

}

export type PointField = FieldBase & {
  type: 'point',
}

export type Field =
  TextField
  | NumberField
  | EmailField
  | TextareaField
  | CheckboxField
  | DateField
  | BlockField
  | GroupField
  | RadioField
  | RelationshipField
  | ArrayField
  | RichTextField
  | SelectField
  | UploadField
  | CodeField
  | JSONField
  | PointField
  | RowField
  | CollapsibleField
  | TabsField
  | UIField;

export type FieldAffectingData =
  TextField
  | NumberField
  | EmailField
  | TextareaField
  | CheckboxField
  | DateField
  | BlockField
  | GroupField
  | RadioField
  | RelationshipField
  | ArrayField
  | RichTextField
  | SelectField
  | UploadField
  | CodeField
  | JSONField
  | PointField
  | TabAsField

export type NonPresentationalField =
  TextField
  | NumberField
  | EmailField
  | TextareaField
  | CheckboxField
  | DateField
  | BlockField
  | GroupField
  | RadioField
  | RelationshipField
  | ArrayField
  | RichTextField
  | SelectField
  | UploadField
  | CodeField
  | JSONField
  | PointField
  | RowField
  | TabsField
  | CollapsibleField;

export type FieldWithPath = Field & {
  path?: string
}

export type FieldWithSubFields =
  GroupField
  | ArrayField
  | RowField
  | CollapsibleField;

export type FieldPresentationalOnly =
  UIField;

export type FieldWithMany =
  SelectField
  | RelationshipField

export type FieldWithMaxDepth =
  UploadField
  | RelationshipField

export function fieldHasSubFields(field: Field): field is FieldWithSubFields {
  return (field.type === 'group' || field.type === 'array' || field.type === 'row' || field.type === 'collapsible');
}

export function fieldIsArrayType(field: Field): field is ArrayField {
  return field.type === 'array';
}

export function fieldIsBlockType(field: Field): field is BlockField {
  return field.type === 'blocks';
}

export function optionIsObject(option: Option): option is OptionObject {
  return typeof option === 'object';
}

export function optionsAreObjects(options: Option[]): options is OptionObject[] {
  return Array.isArray(options) && typeof options?.[0] === 'object';
}

export function optionIsValue(option: Option): option is string {
  return typeof option === 'string';
}

export function fieldSupportsMany(field: Field): field is FieldWithMany {
  return field.type === 'select' || field.type === 'relationship';
}

export function fieldHasMaxDepth(field: Field): field is FieldWithMaxDepth {
  return (field.type === 'upload' || field.type === 'relationship') && typeof field.maxDepth === 'number';
}

export function fieldIsPresentationalOnly(field: Field | TabAsField): field is UIField {
  return field.type === 'ui';
}

export function fieldAffectsData(field: Field | TabAsField): field is FieldAffectingData {
  return 'name' in field && !fieldIsPresentationalOnly(field);
}

export function tabHasName(tab: Tab): tab is NamedTab {
  return 'name' in tab;
}

export function fieldIsLocalized(field: Field | Tab): boolean {
  return 'localized' in field && field.localized;
}

export type HookName = 'beforeRead' | 'beforeChange' | 'beforeValidate' | 'afterChange' | 'afterRead';
