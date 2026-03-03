import { Box, Button, Typography, Slider, Stack } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ColorSelector from '@components/options/ColorSelector';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import useImage from 'use-image';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  topText: 'TOP TEXT',
  bottomText: 'BOTTOM TEXT',
  fontSize: 40,
  textColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 2
};

export default function MemeGenerator({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [input, setInput] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [image] = useImage(imageUrl || '');
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayScale, setDisplayScale] = useState(1);

  const [topTextPos, setTopTextPos] = useState({ x: 0, y: 50 });
  const [bottomTextPos, setBottomTextPos] = useState({ x: 0, y: 350 });

  useEffect(() => {
    const updateScale = () => {
      if (image && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scale = Math.min(1, (containerWidth - 32) / image.width);
        setDisplayScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [image]);

  useEffect(() => {
    if (input) {
      const url = URL.createObjectURL(input);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [input]);

  useEffect(() => {
    if (image) {
      setTopTextPos({ x: image.width / 2, y: 50 });
      setBottomTextPos({ x: image.width / 2, y: image.height - 100 });
    }
  }, [image]);

  const handleExport = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 1 / displayScale
      });
      const link = document.createElement('a');
      link.download = 'meme.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('memeGenerator.textContent'),
      component: (
        <Stack spacing={2}>
          <TextFieldWithDesc
            title={t('memeGenerator.topText')}
            value={values.topText}
            onOwnChange={(v) => updateField('topText', v)}
          />
          <TextFieldWithDesc
            title={t('memeGenerator.bottomText')}
            value={values.bottomText}
            onOwnChange={(v) => updateField('bottomText', v)}
          />
        </Stack>
      )
    },
    {
      title: t('memeGenerator.styling'),
      component: (
        <Stack spacing={2}>
          <Typography gutterBottom>{t('memeGenerator.fontSize')}</Typography>
          <Slider
            value={values.fontSize}
            min={10}
            max={100}
            onChange={(_, v) => updateField('fontSize', v as number)}
            valueLabelDisplay="auto"
          />
          <ColorSelector
            description={t('memeGenerator.textColor')}
            value={values.textColor}
            onColorChange={(v) => updateField('textColor', v)}
          />
          <ColorSelector
            description={t('memeGenerator.outlineColor')}
            value={values.strokeColor}
            onColorChange={(v) => updateField('strokeColor', v)}
          />
          <Typography gutterBottom>
            {t('memeGenerator.outlineWidth')}
          </Typography>
          <Slider
            value={values.strokeWidth}
            min={0}
            max={10}
            onChange={(_, v) => updateField('strokeWidth', v as number)}
            valueLabelDisplay="auto"
          />
        </Stack>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={() => {}}
      input={input}
      renderCustomInput={(values) => (
        <Stack spacing={2} alignItems="center">
          <ToolImageInput
            value={input}
            onChange={setInput}
            accept={['image/*']}
            title={t('memeGenerator.uploadImage')}
          />
          {image && (
            <Box
              ref={containerRef}
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <Box
                sx={{
                  border: '1px solid #ccc',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}
              >
                <Stage
                  width={image.width * displayScale}
                  height={image.height * displayScale}
                  scaleX={displayScale}
                  scaleY={displayScale}
                  ref={stageRef}
                  style={{ backgroundColor: '#f0f0f0' }}
                >
                  <Layer>
                    <KonvaImage image={image} />
                    <Text
                      text={values.topText}
                      x={topTextPos.x}
                      y={topTextPos.y}
                      draggable
                      fontSize={values.fontSize}
                      fill={values.textColor}
                      stroke={values.strokeColor}
                      strokeWidth={values.strokeWidth}
                      fontStyle="bold"
                      fontFamily="Impact, sans-serif"
                      align="center"
                      width={image.width}
                      offsetX={image.width / 2}
                      onDragEnd={(e) =>
                        setTopTextPos({ x: e.target.x(), y: e.target.y() })
                      }
                    />
                    <Text
                      text={values.bottomText}
                      x={bottomTextPos.x}
                      y={bottomTextPos.y}
                      draggable
                      fontSize={values.fontSize}
                      fill={values.textColor}
                      stroke={values.strokeColor}
                      strokeWidth={values.strokeWidth}
                      fontStyle="bold"
                      fontFamily="Impact, sans-serif"
                      align="center"
                      width={image.width}
                      offsetX={image.width / 2}
                      onDragEnd={(e) =>
                        setBottomTextPos({ x: e.target.x(), y: e.target.y() })
                      }
                    />
                  </Layer>
                </Stage>
              </Box>
              <Button variant="contained" onClick={handleExport} sx={{ mt: 2 }}>
                {t('memeGenerator.downloadMeme')}
              </Button>
            </Box>
          )}
        </Stack>
      )}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
