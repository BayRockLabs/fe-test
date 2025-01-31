// @mui

import React, { useMemo } from 'react';

import { alpha, Theme, useTheme, styled } from '@mui/material/styles';

import { BoxProps, Box, Typography } from '@mui/material';

// theme

import { ColorSchema } from '../theme/palette';




// ----------------------------------------------------------------------










// ----------------------------------------------------------------------






const styleFilled = (color, theme) => ({

    color: theme.palette[color].contrastText,

    backgroundColor: theme.palette[color].main,

});




const styleOutlined = (color, theme) => ({

    color: theme.palette[color].main,

    backgroundColor: 'transparent',

    border: `1px solid ${theme.palette[color].main}`,

});




export const styleGhost = (color, theme) => ({

    backgroundColor: alpha(theme.palette[color].main, 0.16),

    color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,

});




export default function Label({

    children,

    color = 'default',

    variant = 'ghost',

    startIcon,

    endIcon,

    sx,

}) {

    const theme = useTheme();




    const style = {

        width: 16,

        height: 16,

        '& svg, img': { width: 1, height: 1, objectFit: 'cover' },

    };




    const RootStyle = useMemo(

        () =>

            styled('span')(({ theme }) => {

                const isLight = theme.palette.mode === 'light';




                return {

                    height: 28,

                    minWidth: 80,

                    lineHeight: 0,

                    borderRadius: 6,

                    cursor: 'default',

                    alignItems: 'center',

                    whiteSpace: 'nowrap',

                    display: 'inline-flex',

                    justifyContent: 'center',

                    padding: theme.spacing(0, 1),

                    color: theme.palette.grey[800],

                    fontSize: theme.typography.pxToRem(14),

                    fontFamily: theme.typography.fontFamily,

                    backgroundColor: theme.palette.grey[300],

                    fontWeight: theme.typography.fontWeightLight,




                    ...(color !== 'default'

                        ? {

                            ...(variant === 'filled' && { ...styleFilled(color, theme) }),

                            ...(variant === 'outlined' && { ...styleOutlined(color, theme) }),

                            ...(variant === 'ghost' && { ...styleGhost(color, theme) }),

                        }

                        : {

                            ...(variant === 'outlined' && {

                                backgroundColor: 'transparent',

                                color: theme.palette.text.primary,

                                border: `1px solid ${theme.palette.grey[500_32]}`,

                            }),

                            ...(variant === 'ghost' && {

                                color: isLight ? theme.palette.text.secondary : theme.palette.common.white,

                                backgroundColor: theme.palette.grey[500_16],

                            }),

                        }),

                };

            }),




        [color, variant]

    );




    return (

        <RootStyle

            sx={{

                ...(startIcon && { pl: 0.75 }),

                ...(endIcon && { pr: 0.75 }),

                ...sx,

            }}

            theme={theme}

        >

            {startIcon && <Box sx={{ mr: 0.75, ...style }}>{startIcon}</Box>}

            <Typography variant="body2">{children}</Typography>

            {endIcon && <Box sx={{ ml: 0.75, ...style }}>{endIcon}</Box>}

        </RootStyle>

    );

}