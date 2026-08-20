import { Box, RangeSlider, Text } from '@shopify/polaris';

/**
 * A quantity field: Polaris `RangeSlider` with the value spelled out beside it.
 *
 * Anything measured on a scale — volume, animation speed, an offset in pixels —
 * belongs on a slider rather than a row of buttons or a number input. Buttons
 * force the merchant to guess how far apart two named steps are, and a number
 * field asks them to type a value they can only judge by looking at the preview.
 * A slider lets them drag while watching the result, which is the whole point of
 * having a preview next to it.
 *
 * Nothing is hand-drawn here: `RangeSlider` already draws the track, the thumb
 * and the value bubble, so this only adds the suffix and the reading below it.
 */

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** The value the way the merchant reads it — "45%", "20px", "Normal". */
  valueLabel?: string;
  /** A second line under the track: what this setting does at that value. */
  helpText?: string;
  disabled?: boolean;
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueLabel,
  helpText,
  disabled,
}: SliderFieldProps) {
  return (
    <RangeSlider
      label={label}
      // The reading sits at the end of the track, Polaris' own suffix slot, so the
      // merchant sees the value without dragging the thumb to raise the bubble.
      suffix={
        valueLabel ? (
          <Box minWidth="4.5rem">
            <Text
              as="span"
              variant="bodySm"
              alignment="end"
              tone={disabled ? 'disabled' : 'subdued'}
            >
              {valueLabel}
            </Text>
          </Box>
        ) : undefined
      }
      value={value}
      min={min}
      max={max}
      step={step}
      output
      disabled={disabled}
      helpText={helpText}
      onChange={(next) => onChange(typeof next === 'number' ? next : Number(next))}
    />
  );
}
