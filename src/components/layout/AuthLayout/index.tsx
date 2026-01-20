'use client';
import { Anchor, Group, Paper, ScrollArea } from '@mantine/core';
import Link from 'next/link';
import classes from './AuthLayout.module.css';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <ScrollArea.Autosize mah={700}>
          <div style={{ maxWidth: 450, margin: '0 auto' }}>
            {children}
            <Group mt="xs" justify="flex-end">
              <Anchor component={Link} href="/" ta="center" size="xs">
                Voltar para a home
              </Anchor>
            </Group>
          </div>
        </ScrollArea.Autosize>
      </Paper>
    </div>
  );
}
