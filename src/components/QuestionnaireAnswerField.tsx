import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { QuestionnaireQuestion, QuestionnaireAnswer, AnswerValue } from '../types';
import { AppInput } from './AppInput';
import { YesNoToggle, YesNoValue } from './YesNoToggle';
import { RatingScale } from './RatingScale';
import { MultiSelectChips } from './MultiSelectChips';
import { DatePickerField } from './DatePickerField';

interface Props {
  question: QuestionnaireQuestion;
  answer: QuestionnaireAnswer | undefined;
  onChange: (next: AnswerValue) => void;
  readOnly?: boolean;
}

export function QuestionnaireAnswerField({ question, answer, onChange, readOnly }: Props) {
  const t = useTheme();
  const value = answer?.value;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <View style={{ marginBottom: t.spacing(5) }}>
      <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '500', marginBottom: 8 }}>
        {question.title}
        {question.required ? <Text style={{ color: t.colors.danger }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );

  if (readOnly) {
    return <Wrapper><ReadOnlyAnswer question={question} value={value} /></Wrapper>;
  }

  switch (question.type) {
    case 'short_text':
    case 'comment':
      return (
        <Wrapper>
          <AppInput
            value={typeof value === 'string' ? value : ''}
            onChangeText={onChange}
            placeholder={question.placeholder ?? 'Введите ответ'}
            containerStyle={{ marginBottom: 0 }}
          />
        </Wrapper>
      );

    case 'long_text':
      return (
        <Wrapper>
          <AppInput
            value={typeof value === 'string' ? value : ''}
            onChangeText={onChange}
            placeholder={question.placeholder ?? 'Введите развернутый ответ'}
            multiline
            containerStyle={{ marginBottom: 0 }}
          />
        </Wrapper>
      );

    case 'number':
      return (
        <Wrapper>
          <AppInput
            value={value != null ? String(value) : ''}
            onChangeText={text => {
              const cleaned = text.replace(/[^\d.,-]/g, '').replace(',', '.');
              const n = cleaned === '' || cleaned === '-' ? null : Number(cleaned);
              onChange(n != null && !isNaN(n) ? n : null);
            }}
            placeholder={question.placeholder ?? 'Число'}
            keyboardType="numeric"
            containerStyle={{ marginBottom: 0 }}
          />
        </Wrapper>
      );

    case 'yes_no': {
      const v: YesNoValue = (value === true) ? 'yes' : (value === false) ? 'no' : (value === null ? 'unspecified' : null);
      return (
        <Wrapper>
          <YesNoToggle
            value={v}
            onChange={(nv) => onChange(nv === 'yes' ? true : nv === 'no' ? false : null)}
          />
        </Wrapper>
      );
    }

    case 'yes_no_comment': {
      const obj = (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value)
        ? value as { value: YesNoValue; comment?: string }
        : { value: null as YesNoValue, comment: '' };
      return (
        <Wrapper>
          <YesNoToggle
            value={obj.value}
            onChange={(nv) => onChange({ value: nv, comment: obj.comment })}
          />
          <View style={{ marginTop: 10 }}>
            <AppInput
              value={obj.comment ?? ''}
              onChangeText={text => onChange({ value: obj.value, comment: text })}
              placeholder="Комментарий (необязательно)"
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        </Wrapper>
      );
    }

    case 'scale_1_10':
      return (
        <Wrapper>
          <RatingScale
            value={typeof value === 'number' ? value : null}
            onChange={onChange}
          />
        </Wrapper>
      );

    case 'single_choice':
      return (
        <Wrapper>
          <MultiSelectChips
            options={question.options ?? []}
            selected={typeof value === 'string' ? [value] : []}
            onChange={(arr) => onChange(arr[0] ?? '')}
            multi={false}
          />
        </Wrapper>
      );

    case 'multi_choice':
      return (
        <Wrapper>
          <MultiSelectChips
            options={question.options ?? []}
            selected={Array.isArray(value) ? value : []}
            onChange={onChange}
          />
        </Wrapper>
      );

    case 'date':
      return (
        <Wrapper>
          <DatePickerField
            value={typeof value === 'string' ? value : null}
            onChange={d => onChange(d ?? null)}
            placeholder="Выбрать дату"
          />
        </Wrapper>
      );

    default:
      return null;
  }
}

function ReadOnlyAnswer({ question, value }: { question: QuestionnaireQuestion; value: AnswerValue | undefined }) {
  const t = useTheme();
  let text = '—';
  if (value != null) {
    if (typeof value === 'string') text = value || '—';
    else if (typeof value === 'number') text = String(value);
    else if (typeof value === 'boolean') text = value ? 'Да' : 'Нет';
    else if (Array.isArray(value)) text = value.length ? value.join(', ') : '—';
    else if (typeof value === 'object' && 'value' in value) {
      const v = value.value === 'yes' ? 'Да' : value.value === 'no' ? 'Нет' : value.value === 'unspecified' ? 'Не указано' : '—';
      text = value.comment ? `${v} — ${value.comment}` : v;
    }
  }
  return (
    <View style={{ backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.sm, padding: 12 }}>
      <Text style={{ color: t.colors.text, fontSize: t.fontSize.md }}>{text}</Text>
    </View>
  );
}
