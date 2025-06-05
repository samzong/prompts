import React from 'react';
import { Button, ButtonGroup, IconButton } from './Button';
import { cn } from '../../utils/cn';

export interface ToolbarProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ className, children }) => {
  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800',
      'border-b border-gray-200 dark:border-gray-700',
      'sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95',
      className
    )}>
      {children}
    </div>
  );
};

export interface ToolbarSectionProps {
  className?: string;
  children: React.ReactNode;
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({ className, children }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
};

// 专用于详情页面的工具栏
export interface DetailToolbarProps {
  title: string;
  onEdit?: (() => void) | undefined;
  onCopy?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  loading?: boolean;
  className?: string;
}

export const DetailToolbar: React.FC<DetailToolbarProps> = ({
  title,
  onEdit,
  onCopy,
  onDelete,
  loading = false,
  className
}) => {
  return (
    <Toolbar className={className}>
      <ToolbarSection>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-md">
          {title}
        </h1>
      </ToolbarSection>

      <ToolbarSection>
        <ButtonGroup>
          {onCopy && (
            <Button
              variant="outline"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              onClick={onCopy}
              loading={loading}
              tooltip="Copy Content"
            >
              Copy
            </Button>
          )}
          {onEdit && (
            <Button
              variant="primary"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              onClick={onEdit}
              loading={loading}
              tooltip="Edit Prompt"
            >
              Edit
            </Button>
          )}
        </ButtonGroup>
        
        {onDelete && (
          <>
            <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2" />
            <IconButton
              variant="ghost"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              onClick={onDelete}
              tooltip="Delete Prompt"
              className="hover:text-red-600 dark:hover:text-red-400"
            />
          </>
        )}
      </ToolbarSection>
    </Toolbar>
  );
};

// 专用于编辑页面的工具栏
export interface EditorToolbarProps {
  title: string;
  isEditing: boolean;
  onCancel?: (() => void) | undefined;
  onSave?: (() => void) | undefined;
  canSave?: boolean;
  isDirty?: boolean;
  loading?: boolean;
  className?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  title,
  isEditing,
  onCancel,
  onSave,
  canSave = false,
  isDirty = false,
  loading = false,
  className
}) => {
  return (
    <Toolbar className={className}>
      <ToolbarSection>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        {isDirty && (
          <div className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes" />
        )}
      </ToolbarSection>

      <ToolbarSection>
        <ButtonGroup>
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              tooltip="Cancel (Esc)"
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={!canSave}
              loading={loading}
              tooltip={`${isEditing ? 'Update' : 'Create'} (Ctrl+S)`}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          )}
        </ButtonGroup>
      </ToolbarSection>
    </Toolbar>
  );
};

// 底部状态栏
export interface StatusBarProps {
  children: React.ReactNode;
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-1.5 bg-gray-50 dark:bg-gray-900',
      'border-t border-gray-200 dark:border-gray-700',
      'text-xs text-gray-500 dark:text-gray-400',
      'sticky bottom-0 z-40',
      className
    )}>
      {children}
    </div>
  );
}; 