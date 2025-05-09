import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Path, Svg} from 'react-native-svg';

import {binaryToSvg} from '@/lib/binaryToSvg';
import barcodes from 'jsbarcode/src/barcodes';

interface BarcodeProps {
  value: string;
  format?: barcodes;
  fill?: string;
}

const Barcode = ({value, format = 'CODE128', fill}: BarcodeProps) => {
  const [bars, setBars] = useState<any>();
  const [width, setWidth] = useState<number>();
  useEffect(() => {
    try {
      const encoded = new barcodes[format](value, {}).encode();
      setBars(binaryToSvg(encoded));
      setWidth(encoded.data.length * 2);
    } catch (error) {
      setBars([]);
      setWidth(0);
    }
  }, [format, value]);
  return (
    <View
      style={{
        alignItems: 'center',
      }}>
      <Svg height={52} width={width}>
        {bars?.map((bar: string, index: number) => <Path key={index} d={bar} fill={fill} />)}
      </Svg>
    </View>
  );
};

export default Barcode;
