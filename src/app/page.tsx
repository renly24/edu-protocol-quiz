import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import ProtocolQuiz from "@/components/ProtocolQuiz";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: { xs: 1.5, sm: 2 } }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={1.5}>
          <Typography variant="h5" component="h1" fontWeight={700} sx={{ fontSize: { xs: "1.3rem", sm: "1.6rem" } }}>
            🧩 プロトコルを答えよう
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Webブラウザから画像をアップロードする流れの中で、それぞれの層で働くプロトコルを答えよう
          </Typography>
        </Box>
        <ProtocolQuiz />
      </Container>
    </Box>
  );
}
