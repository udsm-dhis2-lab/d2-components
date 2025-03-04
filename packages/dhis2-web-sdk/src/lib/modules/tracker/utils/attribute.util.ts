import {
  Attribute,
  AttributeEntity,
  AttributeValueEntity,
} from '../models/attribute.model';

export class AttributeUtil {
  static getAttribute(
    attributeId: string,
    attributes: Attribute[],
    code?: string
  ) {
    if (code) {
      return (attributes || []).find((attribute) => attribute.code === code);
    }

    return (attributes || []).find(
      (attribute) => attribute.attribute === attributeId
    );
  }

  static getAttributeValue(
    attributeId: string,
    attributes: Attribute[]
  ): string | undefined {
    return AttributeUtil.getAttribute(attributeId, attributes)?.value;
  }

  static setAttributeValue(
    attributes: Attribute[],
    attribute: string,
    value: string | number,
    code?: string
  ): Attribute[] {
    const availableAttribute: Attribute | undefined =
      AttributeUtil.getAttribute(attribute, attributes, code);

    if (!availableAttribute) {
      return [
        ...(attributes || []),
        {
          attribute,
          code,
          value,
        },
      ];
    }

    const attributeIndex = attributes.indexOf(availableAttribute);

    return [
      ...attributes.slice(0, attributeIndex),
      { ...availableAttribute, value },
      ...attributes.slice(attributeIndex + 1),
    ];
  }

  static getAttributeEntities(attributes: Attribute[]): AttributeEntity {
    return (attributes || []).reduce((entity, attribute: any) => {
      return {
        ...entity,
        [attribute.attribute]: attribute,
      };
    }, {});
  }

  static getAttributeValueEntities(
    attributes: Attribute[]
  ): AttributeValueEntity {
    return (attributes || []).reduce((entity, attribute: Attribute) => {
      return {
        ...entity,
        [attribute?.attribute]: attribute?.value,
      };
    }, {});
  }

  static sanitizeAttributes(attributes: Attribute[]): Attribute[] {
    return (attributes || []).filter(
      (attribute) => attribute.value && attribute.value.toString().length > 0
    );
  }
}
