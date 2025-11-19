'use client';
import { Anchor, Group, Paper, ScrollArea } from '@mantine/core';
import Link from 'next/link';
import classes from './AuthLayout.module.css';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <ScrollArea.Autosize mah={700}>
          {children}
          <Group mt="xs" justify="flex-end">
            <Anchor component={Link} href="/" ta="center" size="xs">
              Voltar para a home
            </Anchor>
          </Group>
        </ScrollArea.Autosize>
      </Paper>
    </div>
  );
}
