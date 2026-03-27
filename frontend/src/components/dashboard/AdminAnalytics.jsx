import { useEffect, useState } from "react";
import { 
  Box, Heading, SimpleGrid, Text, Spinner, VStack, HStack, 
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex, Progress 
} from "@chakra-ui/react";
import { getAllScores } from "../../api";
import { motion } from "framer-motion";

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

export default function AdminAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    selectionRate: 0,
    langDist: {},
    scoreRanges: [0, 0, 0, 0] // 0-5, 6-10, 11-13, 14-15
  });

  useEffect(() => {
    getAllScores()
      .then(res => {
        setData(res);
        calculateStats(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const calculateStats = (records) => {
    if (!records || !records.length) {
      setStats({
        total: 0,
        avgScore: 0,
        selectionRate: 0,
        langDist: {},
        scoreRanges: [0, 0, 0, 0]
      });
      return;
    }
    
    const total = records.length;
    let sum = 0;
    let selectedCount = 0;
    const langs = {};
    const ranges = [0, 0, 0, 0];

    records.forEach(r => {
      const s = r.score || 0;
      sum += s;
      if (r.selection === "selected") selectedCount++;
      
      // Language distribution
      const l = r.language || "Unknown";
      langs[l] = (langs[l] || 0) + 1;

      // Score ranges
      if (s <= 5) ranges[0]++;
      else if (s <= 10) ranges[1]++;
      else if (s <= 13) ranges[2]++;
      else ranges[3]++;
    });

    setStats({
      total,
      avgScore: (sum / total).toFixed(1),
      selectionRate: ((selectedCount / total) * 100).toFixed(0),
      langDist: langs,
      scoreRanges: ranges
    });
  };

  if (loading) return <Flex justify="center" p={20}><Spinner size="xl" color="cyan.400" /></Flex>;

  return (
    <Box maxW="1000px" mx="auto" mt={6} pb={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={4}>
          <Heading size="xl" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text" mb={2}>
            Recruitment Analytics
          </Heading>
          <Text color="gray.400">Real-time insights into candidate performance and trends</Text>
        </Box>

        {/* Top Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatCard label="Total Candidates" value={stats.total} help="Registered users" color="cyan.400" />
          <StatCard label="Average Score" value={`${stats.avgScore}/15`} help="Overall performance" color="purple.400" />
          <StatCard label="Selection Rate" value={`${stats.selectionRate}%`} help="Candidates moving forward" color="green.400" />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Language Distribution */}
          <MotionBox
            p={6}
            bg="rgba(20,25,35,0.8)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.05)"
          >
            <Heading size="md" mb={6} color="white">Language Popularity</Heading>
            <VStack spacing={4} align="stretch">
              {Object.entries(stats.langDist).map(([lang, count], i) => (
                <Box key={lang}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" color="gray.300">{lang}</Text>
                    <Text fontSize="sm" fontWeight="bold" color="cyan.300">{Math.round((count/stats.total)*100)}%</Text>
                  </HStack>
                  <Progress 
                    value={(count/stats.total)*100} 
                    size="sm" 
                    borderRadius="full" 
                    bg="rgba(255,255,255,0.05)"
                    colorScheme={i % 2 === 0 ? "cyan" : "purple"}
                  />
                </Box>
              ))}
            </VStack>
          </MotionBox>

          {/* Performance Heatmap */}
          <MotionBox
            p={6}
            bg="rgba(20,25,35,0.8)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.05)"
          >
            <Heading size="md" mb={6} color="white">Score Distribution</Heading>
            <HStack align="flex-end" spacing={4} h="200px" justify="center" pb={6}>
              {stats.scoreRanges.map((val, i) => {
                const labels = ["0-5", "6-10", "11-13", "14-15"];
                const pct = stats.total > 0 ? (val / stats.total) * 100 : 0;
                return (
                  <VStack key={i} spacing={2} flex={1}>
                    <MotionBox
                      w="full"
                      bgGradient="linear(to-t, purple.600, cyan.400)"
                      borderRadius="lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      minH="10px"
                    />
                    <Text fontSize="10px" color="gray.500" fontWeight="bold">{labels[i]}</Text>
                  </VStack>
                );
              })}
            </HStack>
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>Number of candidates per score bracket</Text>
          </MotionBox>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}

function StatCard({ label, value, help, color }) {
  return (
    <MotionBox
      whileHover={{ y: -5 }}
      p={6}
      bg="rgba(20,25,35,0.8)"
      backdropFilter="blur(10px)"
      borderRadius="2xl"
      border="1px solid rgba(255,255,255,0.05)"
      boxShadow="xl"
    >
      <Stat>
        <StatLabel color="gray.400" fontSize="sm">{label}</StatLabel>
        <StatNumber fontSize="3xl" fontWeight="bold" color={color}>{value}</StatNumber>
        <StatHelpText color="gray.600" fontSize="xs">{help}</StatHelpText>
      </Stat>
    </MotionBox>
  );
}
