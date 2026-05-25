'use client';

import { View } from '@react-three/drei';
import { forwardRef, type CSSProperties, type ReactNode } from 'react';

interface DemoViewProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Per-demo 3D region tracker.
 *
 * Wraps drei's `<View>` so demos can declare a DOM rectangle and have
 * the global Canvas render its 3D children scissored to that rect.
 *
 * Usage:
 *   <DemoView className="h-[60vh] w-full">
 *     <mesh><boxGeometry /><meshNormalMaterial /></mesh>
 *   </DemoView>
 */
export const DemoView = forwardRef<HTMLDivElement, DemoViewProps>(
  function DemoView({ children, className, style }, ref) {
    return (
      <View ref={ref} className={className} style={style}>
        {children}
      </View>
    );
  }
);
