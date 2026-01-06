import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { AddCircle, TextFields } from "@mui/icons-material";
import { CircularProgress, Grid, Stack } from "@mui/material";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import CampaignModalPhrase from "../../components/CampaignModalPhrase";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    borderRadius: 12,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const CampaignsPhrase = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);

  const [campaignflows, setCampaignFlows] = useState([]);
  const [ModalOpenPhrase, setModalOpenPhrase] = useState(false);
  const [campaignflowSelected, setCampaignFlowSelected] = useState();

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/flowcampaign/${campaignId}`);
      toast.success("Frase deletada");
      getCampaigns();
    } catch (err) {
      toastError(err);
    }
  };

  const getCampaigns = async () => {
    setLoading(true);
    await api
      .get("/flowcampaign")
      .then((res) => {
        setCampaignFlows(res.data.flow);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSaveModal = () => {
    getCampaigns();
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
            deletingCampaign.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingContact.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <CampaignModalPhrase
        open={ModalOpenPhrase}
        onClose={() => setModalOpenPhrase(false)}
        FlowCampaignId={campaignflowSelected}
        onSave={onSaveModal}
      />

      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={8} item>
            <Title>Campanhas</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={6} sm={6} item>
                {/* <TextField
                  fullWidth
                  placeholder={i18n.t("campaigns.searchPlaceholder")}
                  type="search"
                  value={searchParam}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                /> */}
              </Grid>
              <Grid xs={6} sm={6} item>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setCampaignFlowSelected();
                    setModalOpenPhrase(true);
                  }}
                  color="primary"
                  style={{ textTransform: "none" }}
                >
                  <Stack direction={"row"} gap={1}>
                    <AddCircle />
                    {"Campanha"}
                  </Stack>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Stack>
          <Grid container style={{ padding: "8px" }}>
            <Grid item xs={4}>
              Nome
            </Grid>
            <Grid item xs={4} align="center">
              Status
            </Grid>
            <Grid item xs={4} align="end">
              {i18n.t("contacts.table.actions")}
            </Grid>
          </Grid>
          <>
            {!loading &&
              campaignflows.map((flow) => (
                <Grid
                  container
                  key={flow.id}
                  sx={{
                    padding: "8px",
                    borderRadius: 4,
                    marginTop: 0.5,
                  }}
                >
                  <Grid item xs={4}>
                    <Stack
                      justifyContent={"center"}
                      height={"100%"}
                      style={{ color: "#252525" }}
                    >
                      <Stack direction={"row"}>
                        <TextFields />
                        <Stack justifyContent={"center"} marginLeft={1}>
                          {flow.name}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={4} align="center" style={{ color: "#252525" }}>
                    <Stack justifyContent={"center"} height={"100%"}>
                      {flow.status ? "Ativo" : "Desativado"}
                    </Stack>
                  </Grid>
                  <Grid item xs={4} align="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setCampaignFlowSelected(flow.id);
                        setModalOpenPhrase(true);
                      }}
                    >
                      <EditIcon style={{ color: "#252525" }} />
                    </IconButton>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingContact(flow);
                          }}
                        >
                          <DeleteOutlineIcon style={{ color: "#252525" }} />
                        </IconButton>
                      )}
                    />
                  </Grid>
                </Grid>
              ))}
            {loading && (
              <Stack
                justifyContent={"center"}
                alignItems={"center"}
                minHeight={"50vh"}
              >
                <CircularProgress />
              </Stack>
            )}
          </>
        </Stack>
      </Paper>
    </MainContainer>
  );
};

export default CampaignsPhrase;
