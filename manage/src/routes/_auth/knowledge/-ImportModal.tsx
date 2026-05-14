import { Modal, Upload, Button, Progress, Result, Space, Typography, App, Spin } from "antd";
import { useLingui } from "@lingui/react/macro";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UploadIcon, DownloadIcon, CheckCircle, XCircle } from "lucide-react";
import { httpClient } from "@/utils/http";
import { KNOWLEDGE_ENDPOINTS, ImportStatus, ImportTaskSchema } from "@/api/knowledge";
import type { ImportTask } from "@/api/knowledge";
import { theme } from "antd";

const POLL_INTERVAL = 2000;

export type ImportModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ImportModal({ open, onClose }: ImportModalProps) {
  const { t } = useLingui();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [task, setTask] = useState<ImportTask | null>(null);
  const [downloading, setDownloading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isProcessing = task?.status === ImportStatus.PROCESSING;

  useEffect(() => {
    if (!open) {
      setTask(null);
      setUploading(false);
      stopPolling();
    }
  }, [open]);

  useEffect(() => {
    if (isProcessing) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isProcessing, task?.id]);

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(() => {
      if (task?.id) pollStatus(task.id);
    }, POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function pollStatus(taskId: string) {
    try {
      const data = await httpClient.get(KNOWLEDGE_ENDPOINTS.importStatus(taskId));
      const parsed = ImportTaskSchema.parse(data);
      setTask(parsed);
      if (parsed.status !== ImportStatus.PROCESSING) {
        void queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      }
    } catch {
      // ignore poll errors
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await httpClient.upload(KNOWLEDGE_ENDPOINTS.import, formData);
      const parsed = ImportTaskSchema.parse(data);
      setTask(parsed);
      if (parsed.status === ImportStatus.PROCESSING) {
        message.info(t`导入任务已创建，正在处理中`);
      }
    } catch {
      message.error(t`导入失败`);
    } finally {
      setUploading(false);
    }
    return false;
  }

  async function handleDownloadTemplate() {
    setDownloading(true);
    try {
      const blob = await httpClient.download(KNOWLEDGE_ENDPOINTS.template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "import-template.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error(t`下载失败`);
    } finally {
      setDownloading(false);
    }
  }

  function handleClose() {
    if (isProcessing) {
      Modal.confirm({
        title: t`导入任务进行中`,
        content: t`关闭后导入将继续执行，确定关闭？`,
        okText: t`确定`,
        cancelText: t`取消`,
        onOk: onClose,
      });
    } else {
      onClose();
    }
  }

  const progress = task
    ? Math.round(((task.success_count + task.fail_count) / Math.max(task.total_count, 1)) * 100)
    : 0;

  return (
    <Modal
      open={open}
      title={t`批量导入知识`}
      onCancel={handleClose}
      footer={
        task && task.status !== ImportStatus.PROCESSING ? (
          <Button onClick={onClose}>{t`关闭`}</Button>
        ) : null
      }
      width={520}
      destroyOnHidden
    >
      {!task ? (
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Typography.Text type="secondary">
              {t`上传 ZIP 压缩包（内含 Excel 表格 + resources/ 资源文件夹）批量导入知识卡片，请先下载模板。`}
            </Typography.Text>
          </div>
          <Button
            icon={<DownloadIcon size={token.fontSize} />}
            loading={downloading}
            onClick={handleDownloadTemplate}
            block
          >
            {t`下载导入模板`}
          </Button>
          <Upload
            accept=".zip"
            beforeUpload={handleUpload}
            showUploadList={false}
            disabled={uploading}
          >
            <Button
              type="primary"
              icon={<UploadIcon size={token.fontSize} />}
              loading={uploading}
              block
            >
              {t`选择文件并导入`}
            </Button>
          </Upload>
        </Space>
      ) : (
        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          {isProcessing && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: token.marginSM }}>
                <Spin size="small" />
                <Typography.Text>{t`正在导入...`}</Typography.Text>
              </div>
              <Progress percent={progress} status="active" />
              <Typography.Text type="secondary">
                {t`已处理 ${task.success_count + task.fail_count} / ${task.total_count} 条`}
                {task.success_count > 0 && ` · ${t`成功`} ${task.success_count}`}
                {task.fail_count > 0 && ` · ${t`失败`} ${task.fail_count}`}
              </Typography.Text>
            </>
          )}

          {task.status === ImportStatus.SUCCESS && (
            <Result
              status="success"
              icon={<CheckCircle size={48} />}
              title={t`导入完成`}
              subTitle={
                <Space orientation="vertical" size="small">
                  <Typography.Text>
                    {t`总计 ${task.total_count} 条，成功 ${task.success_count} 条`}
                    {task.fail_count > 0 && t`，失败 ${task.fail_count} 条`}
                  </Typography.Text>
                </Space>
              }
            />
          )}

          {task.status === ImportStatus.FAILED && (
            <Result
              status="error"
              icon={<XCircle size={48} />}
              title={t`导入失败`}
              subTitle={
                task.total_count === 0
                  ? t`Excel 文件为空`
                  : t`总计 ${task.total_count} 条，全部失败`
              }
            />
          )}

          {task.error_log && (
            <div
              style={{
                maxHeight: 200,
                overflow: "auto",
                background: token.colorFillQuaternary,
                borderRadius: token.borderRadius,
                padding: token.paddingSM,
              }}
            >
              <Typography.Text
                type="danger"
                style={{ fontSize: token.fontSizeSM, whiteSpace: "pre-wrap" }}
              >
                {task.error_log}
              </Typography.Text>
            </div>
          )}
        </Space>
      )}
    </Modal>
  );
}
