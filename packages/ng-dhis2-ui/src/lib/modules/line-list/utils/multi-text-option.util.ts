import { Option } from '../models/line-list.models';

const getOptionCode = (option: Option): string | undefined =>
  option.code ?? option.value ?? option.id;

const getMultiOptionCodes = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value !== 'string') {
    return value == null ? [] : [String(value)];
  }

  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const formatMultiTextOptionValue = (
  value: unknown,
  options: Option[] = []
): string => {
  const optionByCode = new Map(
    options
      .map((option) => [getOptionCode(option), option] as const)
      .filter(([code]) => !!code)
  );

  const codes = getMultiOptionCodes(value);

  return codes.map((code) => optionByCode.get(code)?.name || code).join(', ');
};
