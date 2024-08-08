import Link from "next/link";
import Image from "next/image";
import {
  Box,
  List,
  ListItem,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Typography,
} from "@mui/material";
// import InfoIcon from "@mui/material/Info";
import SvgIcon from "@mui/material/SvgIcon";

export default function Sidebar({
  validUsers,
  enableLocal,
  enableNgc,
  enableNvcf,
  version,
}) {
  return (
    <Box
      id="separator-sidebar"
      sx={{
        width: "25%",
        height: "100vh",
        transition: "transform 0.3s",
        transform: { xs: "translateX(-100%)", sm: "translateX(0)" },
        bgcolor: "grey.50",
        color: "black",
      }}
      aria-label="Sidebar"
    >
      <Box sx={{ height: "100%", px: 3, py: 4, overflowY: "auto" }}>
        <Link href="https://huggingface.co/autotrain" target="_blank">
          <Box sx={{ display: "flex", alignItems: "center", mb: 5 }}>
            <Image
              src="https://raw.githubusercontent.com/huggingface/autotrain-advanced/main/static/logo.png"
              alt="AutoTrain Logo"
              width={24}
              height={24}
            />
          </Box>
        </Link>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ fontWeight: "medium" }}>
          <ListItem
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <InputLabel
              htmlFor="autotrain_user"
              sx={{
                fontSize: "small",
                fontWeight: "medium",
                color: "grey.700",
              }}
            >
              Hugging Face User
            </InputLabel>
            <Select
              variant="standard"
              name="autotrain_user"
              id="autotrain_user"
              fullWidth
              sx={{
                mt: 1,
                p: "0.25rem 1rem",
                borderColor: "grey.300",
                bgcolor: "white",
                borderRadius: 1,
                boxShadow: 1,
                "&:focus": {
                  outline: "none",
                  ring: "indigo.500",
                  borderColor: "indigo.500",
                },
              }}
            >
              {validUsers.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </ListItem>
          <ListItem
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <InputLabel
              htmlFor="task"
              sx={{
                fontSize: "small",
                fontWeight: "medium",
                color: "grey.700",
              }}
            >
              Task
            </InputLabel>
            <Select
              variant="standard"
              id="task"
              name="task"
              fullWidth
              sx={{
                mt: 1,
                p: "0.25rem 1rem",
                borderColor: "grey.300",
                bgcolor: "white",
                borderRadius: 1,
                boxShadow: 1,
                "&:focus": {
                  outline: "none",
                  ring: "indigo.500",
                  borderColor: "indigo.500",
                },
              }}
            >
              <Box
                sx={{
                  maxHeight: "10rem",
                  overflow: "auto",
                }}
              >
                <optgroup label="LLM Finetuning"></optgroup>
                <MenuItem value="llm:sft">LLM SFT</MenuItem>
                <MenuItem value="llm:orpo">LLM ORPO</MenuItem>
                <MenuItem value="llm:generic">LLM Generic</MenuItem>
                <MenuItem value="llm:dpo">LLM DPO</MenuItem>
                <MenuItem value="llm:reward">LLM Reward</MenuItem>
                <optgroup label="VLM Finetuning"></optgroup>
                <MenuItem value="vlm:captioning">VLM Captioning</MenuItem>
                <MenuItem value="vlm:vqa">VLM VQA</MenuItem>
                <optgroup label="Sentence Transformers"></optgroup>
                <MenuItem value="st:pair">ST Pair</MenuItem>
                <MenuItem value="st:pair_class">
                  ST Pair Classification
                </MenuItem>
                <MenuItem value="st:pair_score">ST Pair Scoring</MenuItem>
                <MenuItem value="st:triplet">ST Triplet</MenuItem>
                <MenuItem value="st:qa">ST Question Answering</MenuItem>
                <optgroup label="Other Text Tasks"></optgroup>
                <MenuItem value="text-classification">
                  Text Classification
                </MenuItem>
                <MenuItem value="text-regression">Text Regression</MenuItem>
                <MenuItem value="seq2seq">Sequence To Sequence</MenuItem>
                <MenuItem value="token-classification">
                  Token Classification
                </MenuItem>
                <optgroup label="Image Tasks"></optgroup>
                <MenuItem value="dreambooth">DreamBooth LoRA</MenuItem>
                <MenuItem value="image-classification">
                  Image Classification
                </MenuItem>
                <MenuItem value="image-regression">
                  Image Scoring/Regression
                </MenuItem>
                <MenuItem value="image-object-detection">
                  Object Detection
                </MenuItem>
                <optgroup label="Tabular Tasks"></optgroup>
                <MenuItem value="tabular:classification">
                  Tabular Classification
                </MenuItem>
                <MenuItem value="tabular:regression">
                  Tabular Regression
                </MenuItem>
              </Box>
              {/* <optgroup label="LLM Finetuning"></optgroup>
              <MenuItem value="llm:sft">LLM SFT</MenuItem>
              <MenuItem value="llm:orpo">LLM ORPO</MenuItem>
              <MenuItem value="llm:generic">LLM Generic</MenuItem>
              <MenuItem value="llm:dpo">LLM DPO</MenuItem>
              <MenuItem value="llm:reward">LLM Reward</MenuItem> */}
              {/* Add other optgroups and options here */}
            </Select>
          </ListItem>
          <ListItem
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <InputLabel
              htmlFor="hardware"
              sx={{
                fontSize: "small",
                fontWeight: "medium",
                color: "grey.700",
              }}
            >
              Hardware
              <IconButton
                id="hardware_info"
                sx={{ color: "grey.500", "&:hover": { color: "grey.700" } }}
              >
                {/* <InfoIcon /> */}
              </IconButton>
            </InputLabel>
            <Select
              variant="standard"
              id="hardware"
              name="hardware"
              fullWidth
              sx={{
                mt: 1,
                p: "0.25rem 1rem",
                borderColor: "grey.300",
                bgcolor: "white",
                borderRadius: 1,
                boxShadow: 1,
                "&:focus": {
                  outline: "none",
                  ring: "indigo.500",
                  borderColor: "indigo.500",
                },
              }}
            >
              {enableLocal === 1 && (
                <MenuItem value="local-ui">Local/Space</MenuItem>
              )}
              {enableLocal === 0 && enableNgc === 0 && enableNvcf === 0 && (
                <>
                  <optgroup label="Hugging Face Spaces">
                    <MenuItem>1xA10G Large</MenuItem>
                    {/* Add other Hugging Face Spaces options */}
                  </optgroup>
                  <optgroup label="Hugging Face Endpoints">
                    <MenuItem value="ep-aws-useast1-m">1xA10G</MenuItem>
                    {/* Add other Hugging Face Endpoints options */}
                  </optgroup>
                </>
              )}
              {/* Add conditions for NGC and NVCF options */}
            </Select>
          </ListItem>
          <ListItem
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <InputLabel
              htmlFor="parameter_mode"
              sx={{
                fontSize: "small",
                fontWeight: "medium",
                color: "grey.700",
              }}
            >
              Parameter Mode
              <IconButton
                id="parameter_mode_info"
                sx={{ color: "grey.500", "&:hover": { color: "grey.700" } }}
              >
                {/* <InfoIcon /> */}
              </IconButton>
            </InputLabel>
            <Select
              variant="standard"
              id="parameter_mode"
              name="parameter_mode"
              fullWidth
              sx={{
                mt: 1,
                p: "0.25rem 1rem",
                borderColor: "grey.300",
                bgcolor: "white",
                borderRadius: 1,
                boxShadow: 1,
                "&:focus": {
                  outline: "none",
                  ring: "indigo.500",
                  borderColor: "indigo.500",
                },
              }}
            >
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="full">Full</MenuItem>
            </Select>
          </ListItem>
        </List>
        <List
          sx={{
            // pt: 4,
            mt: 2,
            fontWeight: "medium",
            borderTop: 1,
            borderColor: "grey.200",
          }}
        >
          <ListItem>
            <Link href="#" id="button_logs">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "grey.900",
                  transition: "background-color 0.3s",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <SvgIcon
                  sx={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    color: "grey.500",
                    transition: "color 0.3s",
                    "&:hover": { color: "grey.900" },
                  }}
                >
                  <path d="M18 0H6a2 2 0 0 0-2 2h14v12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
                  <path d="M14 4H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM2 16v-6h12v6H2Z" />
                </SvgIcon>
                <Typography sx={{ ml: 3 }}>Logs</Typography>
              </Box>
            </Link>
          </ListItem>
          {/* Add other list items for Documentation, FAQs, and GitHub Repo */}
        </List>
      </Box>
    </Box>
  );
}
