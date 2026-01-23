'use client';
import { Anchor, Box, Group, Paper, ScrollArea } from '@mantine/core';
import Link from 'next/link';
import classes from './AuthLayout.module.css';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <ScrollArea.Autosize mah={700}>
          <Box maw={{ base: '100%', sm: 450 }} mx="auto">
            {children}
            <Group mt="xs" justify="flex-end">
              <Anchor component={Link} href="/" ta="center" size="xs">
                Voltar para a home
              </Anchor>
            </Group>
          </Box>
        </ScrollArea.Autosize>
      </Paper>
    </div>
  );
}
