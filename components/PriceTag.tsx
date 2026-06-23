import Link from 'next/link';

type PriceTagProps = {
  price: number;
  unit: string;
  label?: string;
  href?: string;
  lowest?: boolean;
  className?: string;
};

export function PriceTag({ price, unit, label, href, lowest = false, className = '' }: PriceTagProps) {
  const content = (
    <>
      {lowest ? <span className="priceTagBadge">LOWEST PRICE</span> : null}
      {label ? <span className="priceTagLabel">{label}</span> : null}
      <span className="priceTagAmount" aria-label={`$${price.toFixed(2)} per ${unit}`}>${price.toFixed(2)}</span>
      <span className="priceTagUnit">/{unit}</span>
    </>
  );

  const classes = `priceTag ${lowest ? 'priceTagLowest' : ''} ${className}`.trim();

  if (href) {
    return <Link href={href} target="_blank" className={classes} aria-label={`${label ? `${label}: ` : ''}$${price.toFixed(2)} per ${unit}. Open flyer`}>{content}</Link>;
  }

  return <div className={classes} role="group" aria-label={`${label ? `${label}: ` : ''}$${price.toFixed(2)} per ${unit}`}>{content}</div>;
}
