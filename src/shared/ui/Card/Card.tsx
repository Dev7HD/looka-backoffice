import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../cx";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add default body padding directly on the card. */
  pad?: boolean;
  /** Elevate on hover. */
  hover?: boolean;
}

export function Card({ pad, hover, className, ...rest }: CardProps) {
  return (
    <div
      className={cx("card", pad && "card--pad", hover && "card--hover", className)}
      {...rest}
    />
  );
}

export function CardHeader({
  title,
  actions,
}: {
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="card__header">
      <span className="card__title">{title}</span>
      {actions}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("card__body", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("card__footer", className)} {...rest} />;
}
