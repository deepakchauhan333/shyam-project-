export async function checkDuplicateUrl(url: string) {
  const { data: existingTools } = await supabase
    .from('tools')
    .select('id, name, url')
    .eq('url', url)
    .single();

  if (existingTools) {
    return {
      isDuplicate: true,
      existingTool: existingTools
    };
  }

  return {
    isDuplicate: false,
    existingTool: null
  };
}

export function validateContent(content: string, minWords: number = 100) {
  const words = content.trim().split(/\s+/).length;
  return {
    isValid: words >= minWords,
    wordCount: words,
    requiredWords: minWords
  };
}