"use client";

import React, { useRef, ReactNode } from "react";
import { cva, VariantProps } from "class-variance-authority";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
  HTMLMotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";

const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

const dockVariants = cva(
  "supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex h-[58px] w-max gap-2 rounded-2xl p-2 backdrop-blur-md",
);

interface DockProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  magnification?: number;
  distance?: number;
  direction?: "top" | "middle" | "bottom";
  className?: string;
}

interface DockIconProps extends Omit<HTMLMotionProps<"div">, "children"> {
  size?: number;
  magnification?: number;
  distance?: number;
  mouseX?: MotionValue<number>;
  children: ReactNode;
  className?: string;
}

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      magnification = DEFAULT_MAGNIFICATION,
      distance = DEFAULT_DISTANCE,
      direction = "bottom",
      ...props
    },
    ref,
  ) => {
    const mouseX = useMotionValue(Infinity);

    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DockIcon) {
          return React.cloneElement(child, {
            mouseX: mouseX,
            magnification: magnification,
            distance: distance,
          } as DockIconProps);
        }
        return child;
      });
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e: React.MouseEvent) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(dockVariants({ className }), {
          "items-start": direction === "top",
          "items-center": direction === "middle",
          "items-end": direction === "bottom",
        })}
      >
        {renderChildren()}
      </motion.div>
    );
  },
);

Dock.displayName = "Dock";

const DockIcon: React.FC<DockIconProps> = ({
  size,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  children,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const width = mouseX
    ? useSpring(
        useTransform(
          useTransform(mouseX, (val) => {
            const bounds = ref.current?.getBoundingClientRect() ?? {
              x: 0,
              width: 0,
            };
            return val - bounds.x - bounds.width / 2;
          }),
          [-distance, 0, distance],
          [40, magnification, 40],
        ),
        {
          mass: 0.1,
          stiffness: 150,
          damping: 12,
        },
      )
    : magnification;

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };
