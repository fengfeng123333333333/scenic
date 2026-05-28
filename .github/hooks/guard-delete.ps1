# PreToolUse hook: 删除操作需要用户确认，创建/编辑自动放行
$input = $input | Out-String
$data = $input | ConvertFrom-Json

$toolName = $data.tool_name
$toolInput = $data.tool_input | ConvertTo-Json -Compress

# 创建/编辑类工具 — 自动放行
$autoAllow = @(
    'create_file',
    'replace_string_in_file',
    'multi_replace_string_in_file',
    'edit_notebook_file',
    'create_directory',
    'create_new_workspace',
    'create_new_jupyter_notebook'
)

# 删除相关工具/操作 — 需要确认
$deleteTools = @('delete_files')
$deleteCommands = @('rm ', 'del ', 'Remove-Item', 'rmdir', 'rd ', 'erase')

$needsApproval = $false

if ($toolName -in $autoAllow) {
    $needsApproval = $false
}
elseif ($toolName -in $deleteTools) {
    $needsApproval = $true
}
elseif ($toolName -eq 'run_in_terminal' -or $toolName -eq 'memory') {
    # 检查是否包含删除命令
    foreach ($cmd in $deleteCommands) {
        if ($toolInput -match $cmd) {
            $needsApproval = $true
            break
        }
    }
}
else {
    # 其他未列出的工具默认放行
    $needsApproval = $false
}

if ($needsApproval) {
    $output = @{
        hookSpecificOutput = @{
            hookEventName = 'PreToolUse'
            permissionDecision = 'ask'
            permissionDecisionReason = '删除操作需要确认'
        }
    }
} else {
    $output = @{
        hookSpecificOutput = @{
            hookEventName = 'PreToolUse'
            permissionDecision = 'allow'
        }
    }
}

$output | ConvertTo-Json -Compress
