export class TranslationUtil {
  static getTranslatedFormName(
    field: Record<string, unknown>,
    locale = 'sw'
  ): string {
    const translation = (
      (field['translations'] as Record<string, unknown>[]) || []
    ).find(
      (translation) =>
        translation['locale'] == locale && translation['property'] == 'NAME'
    );

    return (
      translation ? translation['value'] : field['formName'] || field['name']
    ) as string;
  }
}
