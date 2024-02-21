import { useContext, useState, MouseEvent } from "react";
import AppContext from "../AppContext";
import PromptDialog from "../PromptDialog/PromptDialog";
import { IconButton, Menu, Toolbar, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";
import jsYaml from "js-yaml";
import ExportRulesCSV from "./ExportRulesCSV";
import ExportArtifacts from "./ExportArtifacts";
import ExportRulesYAML from "./ExportRulesYAML";

export default function Controls() {
  const [discardDialog, setDiscardDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const {
    dataService,
    ruleTemplate,
    selectedRule,
    setSelectedRule,
    isRuleSelected,
    unmodifiedRule,
    setUnmodifiedRule,
    modifiedRule,
    setModifiedRule,
    setDirtyExplorerList,
    isRuleDirty,
    setAlertState,
    isRuleModifiable,
  } = useContext(AppContext);

  const newRule = () => {
    setSelectedRule(null);
    setUnmodifiedRule({ content: ruleTemplate, history: [] });
    setModifiedRule(ruleTemplate);
  };

  const saveRule = async () => {
    if (isRuleSelected()) {
      //Patchrule
      const rule = await dataService.patch_rule(selectedRule, modifiedRule);
      setModifiedRule(rule.content);
      setUnmodifiedRule(rule);
    } else {
      //Postrule
      const newSelectedRule = await dataService.post_rule(modifiedRule);
      setSelectedRule(newSelectedRule);
    }
    setDirtyExplorerList(true);
    setAlertState({ message: "Saved successfully", severity: "success" });
  };

  const discardChanges = () => {
    setModifiedRule(unmodifiedRule.content);
  };

  const deleteRule = async () => {
    const res: Response = await dataService.delete_rule(selectedRule);
    if (res.status === 204) {
      newRule();
      setDirtyExplorerList(true);
      setAlertState({
        message: "Deleted rule successfully",
        severity: "success",
      });
    } else {
      setAlertState({ message: "Rule not deleted", severity: "error" });
    }
  };

  const publishRule = async () => {
    try {
      jsYaml.load(modifiedRule);
      const rule = await dataService.publish_rule(selectedRule);
      setModifiedRule(rule.content);
      setUnmodifiedRule(rule);
      setDirtyExplorerList(true);
      setAlertState({
        message: "Published successfully",
        severity: "success",
      });
    } catch (yamlException) {
      setAlertState({
        message: `Rule not published: ${yamlException.message}`,
        severity: "error",
      });
    }
  };

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const open = Boolean(exportAnchorEl);
  const handleExport = (event: MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };
  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  return (
    <>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          bgcolor: "#DDEEFF",
        }}
      >
        <Tooltip title="New Rule">
          <span>
            <IconButton
              disabled={
                isRuleDirty() || !isRuleSelected() || !isRuleModifiable()
              }
              onClick={newRule}
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Save Rule">
          <span>
            <IconButton
              disabled={!isRuleDirty() || !isRuleModifiable()}
              onClick={saveRule}
              color="primary"
            >
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Discard Changes">
          <span>
            <IconButton
              disabled={!isRuleDirty()}
              onClick={() => setDiscardDialog(true)}
              color="primary"
            >
              <RestoreIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Delete Rule">
          <span>
            <IconButton
              disabled={!isRuleSelected() || !isRuleModifiable()}
              onClick={() => setDeleteDialog(true)}
              color="primary"
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={"Publish Rule"}>
          <span>
            <IconButton
              disabled={
                isRuleDirty() || !isRuleSelected() || !isRuleModifiable()
              }
              onClick={publishRule}
              color="primary"
            >
              <PublishIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip id="export-button" title={"Export..."}>
          <span>
            <IconButton onClick={handleExport} color="primary">
              <FileDownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Menu
          id="export-menu"
          anchorEl={exportAnchorEl}
          open={open}
          onClose={handleExportClose}
          MenuListProps={{
            "aria-labelledby": "export-button",
          }}
        >
          <ExportArtifacts onClose={handleExportClose} />
          <ExportRulesCSV onClose={handleExportClose} />
          <ExportRulesYAML onClose={handleExportClose} />
        </Menu>

        <QuickSearchToolbar label="Search YAML..." queryParam={"content"} />
      </Toolbar>

      {/* TODO:
      Get rid of or use ControlButton
      Implement YAML
      Add closing to csv and yaml
      Better naming for these state vars
      Move export artifacts to own file
       */}

      <PromptDialog
        contentText="Discard changes?"
        open={discardDialog}
        setOpen={setDiscardDialog}
        handleOkay={discardChanges}
      />
      <PromptDialog
        contentText="Delete selected rule?"
        open={deleteDialog}
        setOpen={setDeleteDialog}
        handleOkay={deleteRule}
      />
    </>
  );
}
